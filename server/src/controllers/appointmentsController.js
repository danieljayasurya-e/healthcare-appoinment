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

const PHI_FIELDS = ['patientName'];

export const listAppointments = async (req, res) => {
  try {
    const { status, date, doctorId } = req.query;

    if (doctorId && date) {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.APPOINTMENTS,
        IndexName: 'doctorId-date-index',
        KeyConditionExpression: 'doctorId = :did AND appointmentDate = :date',
        ExpressionAttributeValues: { ':did': doctorId, ':date': date },
      }));
      const items = await decryptItems(result.Items ?? []);
      return res.json({ success: true, data: items });
    }

    if (status && date) {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.APPOINTMENTS,
        IndexName: 'status-date-index',
        KeyConditionExpression: '#s = :status AND appointmentDate = :date',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':status': status, ':date': date },
      }));
      const items = await decryptItems(result.Items ?? []);
      return res.json({ success: true, data: items });
    }

    let filterExpr = '';
    const exprValues = {};
    const exprNames  = {};

    if (status) {
      filterExpr = '#s = :status';
      exprNames['#s']   = 'status';
      exprValues[':status'] = status;
    }

    const scanParams = {
      TableName: TABLES.APPOINTMENTS,
      ...(filterExpr && {
        FilterExpression: filterExpr,
        ExpressionAttributeValues: exprValues,
        ExpressionAttributeNames: exprNames,
      }),
    };

    const result = await docClient.send(new ScanCommand(scanParams));
    const items  = await decryptItems(result.Items ?? []);
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('List appointments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

export const myAppointments = async (req, res) => {
  try {
    const { role, doctorId, patientId } = req.user;

    if (role === 'admin') {
      const result = await docClient.send(new ScanCommand({ TableName: TABLES.APPOINTMENTS }));
      const items  = await decryptItems(result.Items ?? []);
      return res.json({ success: true, data: items });
    }

    if (role === 'doctor' && doctorId) {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.APPOINTMENTS,
        IndexName: 'doctorId-date-index',
        KeyConditionExpression: 'doctorId = :did',
        ExpressionAttributeValues: { ':did': doctorId },
      }));
      const items = await decryptItems(result.Items ?? []);
      return res.json({ success: true, data: items });
    }

    if (role === 'patient' && patientId) {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.APPOINTMENTS,
        IndexName: 'patientId-date-index',
        KeyConditionExpression: 'patientId = :pid',
        ExpressionAttributeValues: { ':pid': patientId },
      }));
      const items = await decryptItems(result.Items ?? []);
      await auditLog({ userId: req.user.userId, action: 'READ', entity: 'appointment', entityId: patientId, transactionStatus: 'success', ipAddress: req.ip ?? '' });
      return res.json({ success: true, data: items });
    }

    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('My appointments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

export const getAppointment = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.APPOINTMENTS,
      Key: { appointmentId: req.params.id },
    }));
    if (!result.Item) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && result.Item.patientId !== req.user.patientId) {
      await auditLog({ userId: req.user.userId, action: 'READ', entity: 'appointment', entityId: req.params.id, transactionStatus: 'failure', ipAddress: ip });
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && result.Item.doctorId !== req.user.doctorId) {
      await auditLog({ userId: req.user.userId, action: 'READ', entity: 'appointment', entityId: req.params.id, transactionStatus: 'failure', ipAddress: ip });
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const item = await decryptItem(result.Item);
    await auditLog({ userId: req.user.userId, action: 'READ', entity: 'appointment', entityId: req.params.id, transactionStatus: 'success', ipAddress: ip });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Get appointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch appointment' });
  }
};

export const createAppointment = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    const {
      patientId, patientName,
      doctorId, doctorName,
      department, appointmentType, disease,
      appointmentDate, appointmentTime,
    } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'patientId, doctorId, appointmentDate, appointmentTime are required',
      });
    }

    const now           = new Date().toISOString();
    const appointmentId = 'APT-' + Date.now();

    const raw = {
      appointmentId,
      patientId,
      patientName:     patientName ?? '',
      doctorId,
      doctorName:      doctorName ?? '',
      department:      department ?? '',
      appointmentType: appointmentType ?? 'Consultation',
      disease:         disease ?? '',
      appointmentDate,
      appointmentTime,
      status:          'Booked',
      createdAt:       now,
      updatedAt:       now,
    };

    const appointment = await encryptItem(raw, PHI_FIELDS);
    await docClient.send(new PutCommand({ TableName: TABLES.APPOINTMENTS, Item: appointment }));
    await auditLog({ userId: req.user.userId, action: 'CREATE', entity: 'appointment', entityId: appointmentId, transactionStatus: 'success', ipAddress: ip });

    res.status(201).json({ success: true, data: raw });
  } catch (err) {
    console.error('Create appointment error:', err);
    await auditLog({ userId: req.user.userId, action: 'CREATE', entity: 'appointment', entityId: '', transactionStatus: 'failure', ipAddress: req.ip ?? '' });
    res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  const ip = req.ip ?? '';
  try {
    const { status } = req.body;
    const VALID_STATUSES = ['Booked', 'Completed', 'Cancelled'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    if (req.user.role === 'doctor') {
      const existing = await docClient.send(new GetCommand({
        TableName: TABLES.APPOINTMENTS,
        Key: { appointmentId: req.params.id },
      }));
      if (!existing.Item) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      if (existing.Item.doctorId !== req.user.doctorId) {
        await auditLog({ userId: req.user.userId, action: 'UPDATE', entity: 'appointment', entityId: req.params.id, transactionStatus: 'failure', ipAddress: ip });
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const now    = new Date().toISOString();
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.APPOINTMENTS,
      Key: { appointmentId: req.params.id },
      UpdateExpression: 'SET #s = :status, updatedAt = :now',
      ExpressionAttributeNames:  { '#s': 'status' },
      ExpressionAttributeValues: { ':status': status, ':now': now },
      ReturnValues: 'ALL_NEW',
    }));

    await auditLog({ userId: req.user.userId, action: 'UPDATE', entity: 'appointment', entityId: req.params.id, transactionStatus: 'success', ipAddress: ip });
    res.json({ success: true, data: result.Attributes });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update appointment status' });
  }
};
