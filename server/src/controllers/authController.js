import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { docClient, TABLES } from '../config/dynamodb.js';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { auditLog } from '../utils/auditLogger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test@123';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

export const login = async (req, res) => {
  const ip = req.ip ?? req.socket?.remoteAddress ?? '';
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const userResult = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email.toLowerCase().trim() },
      Limit: 1,
    }));

    const user = userResult.Items?.[0];
    if (!user) {
      await auditLog({ userId: 'anonymous', action: 'LOGIN_FAILED', entity: 'user', entityId: email.toLowerCase().trim(), transactionStatus: 'failure', ipAddress: ip });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      await auditLog({ userId: user.userId, action: 'LOGIN_FAILED', entity: 'user', entityId: user.userId, transactionStatus: 'failure', ipAddress: ip });
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await auditLog({ userId: user.userId, action: 'LOGIN_FAILED', entity: 'user', entityId: user.userId, transactionStatus: 'failure', ipAddress: ip });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const mappingResult = await docClient.send(new QueryCommand({
      TableName: TABLES.USER_ROLE_MAPPING,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': user.userId },
      Limit: 1,
    }));

    const mapping = mappingResult.Items?.[0];
    if (!mapping) {
      return res.status(403).json({ success: false, message: 'No role assigned to this user' });
    }

    const roleResult = await docClient.send(new GetCommand({
      TableName: TABLES.ROLES,
      Key: { roleId: mapping.roleId },
    }));

    const roleName = roleResult.Item?.roleName ?? 'patient';

    let profileId = null;
    if (roleName === 'doctor') {
      const docResult = await docClient.send(new QueryCommand({
        TableName: TABLES.DOCTORS,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': user.userId },
        Limit: 1,
      }));
      profileId = docResult.Items?.[0]?.doctorId ?? null;
    } else if (roleName === 'patient') {
      const patResult = await docClient.send(new QueryCommand({
        TableName: TABLES.PATIENTS,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': user.userId },
        Limit: 1,
      }));
      profileId = patResult.Items?.[0]?.patientId ?? null;
    }

    const payload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: roleName,
      ...(roleName === 'doctor' && { doctorId: profileId }),
      ...(roleName === 'patient' && { patientId: profileId }),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    await auditLog({ userId: user.userId, action: 'LOGIN_SUCCESS', entity: 'user', entityId: user.userId, transactionStatus: 'success', ipAddress: ip });

    return res.json({ success: true, token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const me = async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId: req.user.userId },
    }));

    if (!result.Item) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password: _pw, ...safeUser } = result.Item;
    return res.json({ success: true, user: { ...safeUser, role: req.user.role } });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
