import { v4 as uuidv4 } from 'uuid';
import { docClient, TABLES } from '../config/dynamodb.js';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const auditLog = async ({ userId, action, entity, entityId, transactionStatus, ipAddress }) => {
  try {
    await docClient.send(new PutCommand({
      TableName: TABLES.AUDIT,
      Item: {
        requestId: uuidv4(),
        createdAt: new Date().toISOString(),
        userId: userId ?? 'anonymous',
        action,
        entity,
        entityId: entityId ?? '',
        transactionStatus,
        ipAddress: ipAddress ?? '',
      },
    }));
  } catch (err) {
    console.error('Audit log write error:', err.message);
  }
};
