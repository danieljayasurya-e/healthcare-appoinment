import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const clientConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

if (process.env.DYNAMO_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMO_ENDPOINT;
}

export const dynamoClient = new DynamoDBClient(clientConfig);

export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues:    false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export const TABLES = {
  APPOINTMENTS:      process.env.DYNAMO_TABLE_APPOINTMENTS      || 'poc_appointments',
  PATIENTS:          process.env.DYNAMO_TABLE_PATIENTS          || 'poc_patients',
  DOCTORS:           process.env.DYNAMO_TABLE_DOCTORS           || 'poc_doctors',
  USERS:             process.env.DYNAMO_TABLE_USERS             || 'users',
  ROLES:             process.env.DYNAMO_TABLE_ROLES             || 'mst_rolemaster',
  USER_ROLE_MAPPING: process.env.DYNAMO_TABLE_USER_ROLE_MAPPING || 'mst_userrolemapping',
  AUDIT:             process.env.DYNAMO_TABLE_AUDIT             || 'poc_audit_logs',
};

export const checkConnection = async () => {
  try {
    const result = await dynamoClient.send(new ListTablesCommand({ Limit: 10 }));
    console.log('DynamoDB connected  |  Region:', process.env.AWS_REGION);
    console.log('Tables visible :', result.TableNames?.join(', ') || '(none yet)');
    return true;
  } catch (err) {
    console.error('❌ DynamoDB connection failed:', err.message);
    return false;
  }
};
