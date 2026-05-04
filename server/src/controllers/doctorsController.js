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

const SALT_ROUNDS = 10;

export const listDoctors = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.DOCTORS,
      FilterExpression: 'isActive = :active',
      ExpressionAttributeValues: { ':active': true },
    }));
    res.json({ success: true, data: result.Items ?? [] });
  } catch (err) {
    console.error('List doctors error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.DOCTORS,
      Key: { doctorId: req.params.id },
    }));
    if (!result.Item) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: result.Item });
  } catch (err) {
    console.error('Get doctor error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch doctor' });
  }
};

export const createDoctor = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    const { name, department, availableSlots = [], email, password } = req.body;

    if (!name || !department) {
      return res.status(400).json({ success: false, message: 'name and department are required' });
    }

    const now = new Date().toISOString();
    let userId = '';

    if (email && password) {
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
          roleId: 'ROLE-002',
          assignedAt: now,
          assignedBy: req.user.userId,
          isActive: true,
        },
      }));
    }

    const doctorId = 'DOC-' + Date.now();
    const doctor = {
      doctorId,
      ...(userId ? { userId } : {}),
      name,
      department,
      availableSlots,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({ TableName: TABLES.DOCTORS, Item: doctor }));

    await auditLog({ userId: req.user.userId, action: 'CREATE', entity: 'doctor', entityId: doctorId, transactionStatus: 'success', ipAddress: ip });

    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    console.error('Create doctor error:', err);
    await auditLog({ userId: req.user.userId, action: 'CREATE', entity: 'doctor', entityId: '', transactionStatus: 'failure', ipAddress: req.ip ?? '' });
    res.status(500).json({ success: false, message: 'Failed to create doctor' });
  }
};

export const updateSlots = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    const { availableSlots } = req.body;
    if (!Array.isArray(availableSlots)) {
      return res.status(400).json({ success: false, message: 'availableSlots must be an array' });
    }

    const now = new Date().toISOString();
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.DOCTORS,
      Key: { doctorId: req.params.id },
      UpdateExpression: 'SET availableSlots = :slots, updatedAt = :now',
      ExpressionAttributeValues: { ':slots': availableSlots, ':now': now },
      ReturnValues: 'ALL_NEW',
    }));

    await auditLog({ userId: req.user.userId, action: 'UPDATE', entity: 'doctor', entityId: req.params.id, transactionStatus: 'success', ipAddress: ip });

    res.json({ success: true, data: result.Attributes });
  } catch (err) {
    console.error('Update slots error:', err);
    res.status(500).json({ success: false, message: 'Failed to update slots' });
  }
};

export const deleteDoctor = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    const now = new Date().toISOString();
    await docClient.send(new UpdateCommand({
      TableName: TABLES.DOCTORS,
      Key: { doctorId: req.params.id },
      UpdateExpression: 'SET isActive = :false, updatedAt = :now',
      ExpressionAttributeValues: { ':false': false, ':now': now },
    }));

    await auditLog({ userId: req.user.userId, action: 'DELETE', entity: 'doctor', entityId: req.params.id, transactionStatus: 'success', ipAddress: ip });

    res.json({ success: true, message: 'Doctor deactivated' });
  } catch (err) {
    console.error('Delete doctor error:', err);
    res.status(500).json({ success: false, message: 'Failed to deactivate doctor' });
  }
};
