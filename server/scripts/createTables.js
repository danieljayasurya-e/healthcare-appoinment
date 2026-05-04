import 'dotenv/config';
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ListTablesCommand,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const tableExists = async (name) => {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (e) {
    if (e.name === 'ResourceNotFoundException') return false;
    throw e;
  }
};

const createTable = async (params) => {
  const name = params.TableName;
  if (await tableExists(name)) {
    console.log(`  ⏭  ${name} — already exists, skipping`);
    return;
  }
  await client.send(new CreateTableCommand(params));
  await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: name });
  console.log(`  ✅  ${name} — created`);
};

const USERS = {
  TableName: 'users',
  BillingMode: 'PAY_PER_REQUEST',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'email-index',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

const MST_ROLEMASTER = {
  TableName: 'mst_rolemaster',
  BillingMode: 'PAY_PER_REQUEST',
  KeySchema: [
    { AttributeName: 'roleId', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'roleId', AttributeType: 'S' },
    { AttributeName: 'roleName', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'roleName-index',
      KeySchema: [{ AttributeName: 'roleName', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

const MST_USERROLEMAPPING = {
  TableName: 'mst_userrolemapping',
  BillingMode: 'PAY_PER_REQUEST',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' },
    { AttributeName: 'roleId', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'roleId', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'roleId-index',
      KeySchema: [{ AttributeName: 'roleId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

const POC_APPOINTMENTS = {
  TableName: 'poc_appointments',
  BillingMode: 'PAY_PER_REQUEST',
  KeySchema: [
    { AttributeName: 'appointmentId', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'appointmentId', AttributeType: 'S' },
    { AttributeName: 'doctorId', AttributeType: 'S' },
    { AttributeName: 'patientId', AttributeType: 'S' },
    { AttributeName: 'status', AttributeType: 'S' },
    { AttributeName: 'appointmentDate', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'doctorId-date-index',
      KeySchema: [
        { AttributeName: 'doctorId', KeyType: 'HASH' },
        { AttributeName: 'appointmentDate', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'patientId-date-index',
      KeySchema: [
        { AttributeName: 'patientId', KeyType: 'HASH' },
        { AttributeName: 'appointmentDate', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'status-date-index',
      KeySchema: [
        { AttributeName: 'status', KeyType: 'HASH' },
        { AttributeName: 'appointmentDate', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

const POC_DOCTORS = {
  TableName: 'poc_doctors',
  BillingMode: 'PAY_PER_REQUEST',
  KeySchema: [
    { AttributeName: 'doctorId', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'doctorId', AttributeType: 'S' },
    { AttributeName: 'department', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'department-index',
      KeySchema: [{ AttributeName: 'department', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'userId-index',
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

const POC_PATIENTS = {
  TableName: 'poc_patients',
  BillingMode: 'PAY_PER_REQUEST',
  KeySchema: [
    { AttributeName: 'patientId', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'patientId', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'email-index',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'userId-index',
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

const POC_AUDIT_LOGS = {
  TableName: 'poc_audit_logs',
  BillingMode: 'PAY_PER_REQUEST',
  KeySchema: [
    { AttributeName: 'requestId', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'requestId', AttributeType: 'S' },
    { AttributeName: 'createdAt', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'entity', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'userId-date-index',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'entity-date-index',
      KeySchema: [
        { AttributeName: 'entity', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

const ALL_TABLES = [
  USERS,
  MST_ROLEMASTER,
  MST_USERROLEMAPPING,
  POC_APPOINTMENTS,
  POC_DOCTORS,
  POC_PATIENTS,
  POC_AUDIT_LOGS,
];

const run = async () => {
  console.log('\nAppointment Booking POC — DynamoDB Table Setup');
  console.log('══════════════════════════════════════════════════');
  console.log(`Region : ${process.env.AWS_REGION}`);
  console.log(`Tables : ${ALL_TABLES.length}\n`);

  try {
    await client.send(new ListTablesCommand({ Limit: 1 }));
    console.log('DynamoDB connection verified\n');
  } catch (err) {
    console.error('Cannot connect to DynamoDB:', err.message);
    process.exit(1);
  }

  for (const table of ALL_TABLES) {
    try {
      await createTable(table);
    } catch (err) {
      console.error(`${table.TableName} — failed: ${err.message}`);
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('✅Table setup complete!\n');
  console.log('Next step: node scripts/seedData.js');
  console.log('══════════════════════════════════════════════════\n');
};

run();
