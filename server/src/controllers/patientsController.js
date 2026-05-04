import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLES } from '../config/dynamodb.js';
import {
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { auditLog } from '../utils/auditLogger.js';
import { encryptItem, decryptItem, decryptItems } from '../utils/kmsEncryption.js';

const SALT_ROUNDS    = 10;
const PHI_FIELDS     = ['name', 'phone', 'email', 'dob'];

export const listPatients = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.PATIENTS,
      FilterExpression: 'isActive = :active',
      ExpressionAttributeValues: { ':active': true },
    }));
    const items = await decryptItems(result.Items ?? []);
    await auditLog({ userId: req.user.userId, action: 'READ', entity: 'patient', entityId: 'all', transactionStatus: 'success', ipAddress: req.ip ?? '' });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('List patients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch patients' });
  }
};

export const getPatient = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    if (req.user.role === 'patient' && req.user.patientId !== req.params.id) {
      await auditLog({ userId: req.user.userId, action: 'READ', entity: 'patient', entityId: req.params.id, transactionStatus: 'failure', ipAddress: ip });
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const result = await docClient.send(new GetCommand({
      TableName: TABLES.PATIENTS,
      Key: { patientId: req.params.id },
    }));
    if (!result.Item) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const item = await decryptItem(result.Item);
    await auditLog({ userId: req.user.userId, action: 'READ', entity: 'patient', entityId: req.params.id, transactionStatus: 'success', ipAddress: ip });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Get patient error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch patient' });
  }
};

export const createPatient = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    const { name, email, phone, gender, dob, password } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'name, email and phone are required' });
    }

    const now = new Date().toISOString();
    let userId;

    if (password) {
      const emailCheck = await docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email.toLowerCase().trim() },
        Limit: 1,
      }));
      if (emailCheck.Items?.length) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }

      userId = uuidv4();
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      await docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          userId,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      }));

      await docClient.send(new PutCommand({
        TableName: TABLES.USER_ROLE_MAPPING,
        Item: {
          userId,
          roleId: 'ROLE-003',
          assignedAt: now,
          assignedBy: req.user.userId,
          isActive: true,
        },
      }));
    }

    const patientId = 'PAT-' + Date.now();
    const raw = {
      patientId,
      ...(userId ? { userId } : {}),
      name,
      email: email.toLowerCase().trim(),
      phone,
      gender: gender ?? '',
      dob: dob ?? '',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const patient = await encryptItem(raw, PHI_FIELDS);
    await docClient.send(new PutCommand({ TableName: TABLES.PATIENTS, Item: patient }));
    await auditLog({ userId: req.user.userId, action: 'CREATE', entity: 'patient', entityId: patientId, transactionStatus: 'success', ipAddress: ip });

    res.status(201).json({ success: true, data: raw });
  } catch (err) {
    console.error('Create patient error:', err);
    await auditLog({ userId: req.user.userId, action: 'CREATE', entity: 'patient', entityId: '', transactionStatus: 'failure', ipAddress: req.ip ?? '' });
    res.status(500).json({ success: false, message: 'Failed to create patient' });
  }
};

export const deletePatient = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    const now = new Date().toISOString();
    await docClient.send(new UpdateCommand({
      TableName: TABLES.PATIENTS,
      Key: { patientId: req.params.id },
      UpdateExpression: 'SET isActive = :false, updatedAt = :now',
      ExpressionAttributeValues: { ':false': false, ':now': now },
    }));
    await auditLog({ userId: req.user.userId, action: 'DELETE', entity: 'patient', entityId: req.params.id, transactionStatus: 'success', ipAddress: ip });
    res.json({ success: true, message: 'Patient deactivated' });
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).json({ success: false, message: 'Failed to deactivate patient' });
  }
};
