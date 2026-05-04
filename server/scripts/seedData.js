import 'dotenv/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const now = new Date().toISOString();
const SALT_ROUNDS = 10;

const putIfNotExists = async (TableName, pkFields, item) => {
  const existing = await docClient.send(new GetCommand({
    TableName,
    Key: pkFields.reduce((acc, f) => ({ ...acc, [f]: item[f] }), {}),
  }));
  if (existing.Item) {
    console.log(`${TableName} [${item[pkFields[0]]}] — already exists`);
    return;
  }
  await docClient.send(new PutCommand({ TableName, Item: item }));
  console.log(`✅ ${TableName} [${item[pkFields[0]]}] — inserted`);
};

const ROLES = [
  {
    roleId: 'ROLE-001',
    roleName: 'admin',
    description: 'Full system access — manages doctors, patients, appointments',
    permissions: ['manage_users', 'manage_doctors', 'manage_patients',
                  'view_all_appointments', 'update_appointment_status',
                  'configure_slots', 'view_audit_logs'],
    isActive: true,
    createdAt: now,
  },
  {
    roleId: 'ROLE-002',
    roleName: 'doctor',
    description: 'Views and updates own assigned appointments',
    permissions: ['view_own_appointments', 'update_appointment_status'],
    isActive: true,
    createdAt: now,
  },
  {
    roleId: 'ROLE-003',
    roleName: 'patient',
    description: 'Books appointments and views confirmation',
    permissions: ['book_appointment', 'view_own_appointments'],
    isActive: true,
    createdAt: now,
  },
];

const ADMIN_USER_ID = 'a1b2c3d4-0001-4000-8000-000000000001';

const buildAdminUser = async () => ({
  userId: ADMIN_USER_ID,
  email: 'admin@demo.com',
  password: await bcrypt.hash('Test@123', SALT_ROUNDS),
  name: 'Admin User',
  phone: '9000000001',
  gender: 'Male',
  dob: '1985-01-01',
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

const ADMIN_ROLE_MAPPING = {
  userId: ADMIN_USER_ID,
  roleId: 'ROLE-001',
  assignedAt: now,
  assignedBy: 'system',
  isActive: true,
};

const run = async () => {
  console.log('\nAppointment Booking POC — Seed Data');
  console.log('══════════════════════════════════════════════════\n');

  console.log('Roles (mst_rolemaster)');
  for (const r of ROLES)
    await putIfNotExists('mst_rolemaster', ['roleId'], r);

  console.log('\nAdmin User (users)');
  const adminUser = await buildAdminUser();
  await putIfNotExists('users', ['userId'], adminUser);

  console.log('\nAdmin Role Mapping (mst_userrolemapping)');
  await putIfNotExists('mst_userrolemapping', ['userId', 'roleId'], ADMIN_ROLE_MAPPING);

  console.log('\n══════════════════════════════════════════════════');
  console.log('✅Seed complete! Login: admin@demo.com / Test@123\n');
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
