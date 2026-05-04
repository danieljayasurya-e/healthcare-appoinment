import 'dotenv/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { encryptItem } from '../src/utils/kmsEncryption.js';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const now = new Date().toISOString();

const putIfNotExists = async (TableName, pkField, item) => {
  const existing = await docClient.send(new GetCommand({
    TableName,
    Key: { [pkField]: item[pkField] },
  }));
  if (existing.Item) {
    console.log(`  ⏭  ${TableName} [${item[pkField]}] — already exists`);
    return;
  }
  await docClient.send(new PutCommand({ TableName, Item: item }));
  console.log(`  ✅  ${TableName} [${item[pkField]}] — inserted`);
};

const DEPARTMENTS = [
  'Cardiology', 'Orthopedics', 'General Medicine', 'Neurology',
  'Dermatology', 'Pediatrics', 'ENT', 'Ophthalmology',
];

const SLOT_SETS = [
  ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'],
  ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM'],
  ['08:30 AM', '10:30 AM', '12:00 PM', '04:00 PM'],
  ['09:30 AM', '11:30 AM', '02:30 PM', '04:30 PM'],
  ['08:00 AM', '10:00 AM', '01:00 PM', '03:30 PM'],
];

const DOCTOR_NAMES = [
  'Dr. Sarah Johnson',      'Dr. James Patel',         'Dr. Michael Williams',
  'Dr. Priya Kumar',        'Dr. David Brown',          'Dr. Emily Davis',
  'Dr. Robert Miller',      'Dr. Ananya Wilson',        'Dr. William Moore',
  'Dr. Jessica Taylor',     'Dr. Mark Anderson',        'Dr. Kavya Thomas',
  'Dr. John Jackson',       'Dr. Olivia White',         'Dr. Daniel Harris',
  'Dr. Sneha Martin',       'Dr. Christopher Thompson', 'Dr. Emma Garcia',
  'Dr. Matthew Martinez',   'Dr. Aisha Robinson',       'Dr. Andrew Clark',
  'Dr. Divya Rodriguez',    'Dr. Joshua Lewis',         'Dr. Neha Lee',
  'Dr. Ryan Walker',        'Dr. Pooja Hall',           'Dr. Kevin Allen',
  'Dr. Meera Young',        'Dr. Brian Hernandez',      'Dr. Riya King',
  'Dr. Eric Wright',        'Dr. Deepa Lopez',          'Dr. Thomas Hill',
  'Dr. Swati Scott',        'Dr. Jason Green',          'Dr. Sunita Adams',
  'Dr. Jeremy Baker',       'Dr. Lakshmi Gonzalez',     'Dr. Patrick Nelson',
  'Dr. Radha Carter',       'Dr. Steven Mitchell',      'Dr. Geeta Perez',
  'Dr. Timothy Roberts',    'Dr. Nisha Turner',         'Dr. Gregory Phillips',
  'Dr. Preeti Campbell',    'Dr. Jeffrey Parker',       'Dr. Seema Evans',
  'Dr. Randy Edwards',      'Dr. Anjali Collins',
];

const DOCTORS = DOCTOR_NAMES.map((name, i) => ({
  doctorId:       `DOC-F${String(i + 1).padStart(3, '0')}`,
  name,
  department:     DEPARTMENTS[i % DEPARTMENTS.length],
  availableSlots: SLOT_SETS[i % SLOT_SETS.length],
  isActive:       true,
  createdAt:      now,
  updatedAt:      now,
}));

const PATIENT_DATA = [
  { name: 'John Patient',       phone: '9876543210', email: 'john.patient@mail.com',       gender: 'Male',   dob: '1990-03-15' },
  { name: 'Anita Sharma',       phone: '9123456780', email: 'anita.sharma@mail.com',       gender: 'Female', dob: '1985-07-22' },
  { name: 'Ravi Kumar',         phone: '9988776655', email: 'ravi.kumar@mail.com',         gender: 'Male',   dob: '2001-01-08' },
  { name: 'Meena Iyer',         phone: '9871234560', email: 'meena.iyer@mail.com',         gender: 'Female', dob: '1978-11-30' },
  { name: 'Arjun Nair',         phone: '9765432100', email: 'arjun.nair@mail.com',         gender: 'Male',   dob: '1995-06-12' },
  { name: 'Sunita Reddy',       phone: '9654321098', email: 'sunita.reddy@mail.com',       gender: 'Female', dob: '1982-04-25' },
  { name: 'Rahul Verma',        phone: '9543210987', email: 'rahul.verma@mail.com',        gender: 'Male',   dob: '1998-09-03' },
  { name: 'Pooja Joshi',        phone: '9432109876', email: 'pooja.joshi@mail.com',        gender: 'Female', dob: '1993-12-17' },
  { name: 'Kiran Shah',         phone: '9321098765', email: 'kiran.shah@mail.com',         gender: 'Male',   dob: '1975-02-28' },
  { name: 'Deepa Menon',        phone: '9210987654', email: 'deepa.menon@mail.com',        gender: 'Female', dob: '1989-08-14' },
  { name: 'Amit Singh',         phone: '9109876543', email: 'amit.singh@mail.com',         gender: 'Male',   dob: '1997-05-20' },
  { name: 'Lakshmi Pillai',     phone: '9098765432', email: 'lakshmi.pillai@mail.com',     gender: 'Female', dob: '1970-10-05' },
  { name: 'Suresh Babu',        phone: '9987654321', email: 'suresh.babu@mail.com',        gender: 'Male',   dob: '1983-07-09' },
  { name: 'Kavitha Rao',        phone: '9876543201', email: 'kavitha.rao@mail.com',        gender: 'Female', dob: '1991-03-27' },
  { name: 'Nikhil Jain',        phone: '9765432012', email: 'nikhil.jain@mail.com',        gender: 'Male',   dob: '2000-11-11' },
  { name: 'Rekha Gupta',        phone: '9654320123', email: 'rekha.gupta@mail.com',        gender: 'Female', dob: '1976-09-18' },
  { name: 'Vijay Krishnan',     phone: '9543201234', email: 'vijay.krishnan@mail.com',     gender: 'Male',   dob: '1988-01-24' },
  { name: 'Nisha Das',          phone: '9432012345', email: 'nisha.das@mail.com',          gender: 'Female', dob: '1994-06-06' },
  { name: 'Manoj Tiwari',       phone: '9320123456', email: 'manoj.tiwari@mail.com',       gender: 'Male',   dob: '1980-04-13' },
  { name: 'Swathi Naidu',       phone: '9201234567', email: 'swathi.naidu@mail.com',       gender: 'Female', dob: '1996-08-29' },
  { name: 'Arun Pillai',        phone: '9112345678', email: 'arun.pillai@mail.com',        gender: 'Male',   dob: '1973-12-01' },
  { name: 'Divya Bose',         phone: '9023456789', email: 'divya.bose@mail.com',         gender: 'Female', dob: '1987-02-16' },
  { name: 'Sanjay Mehta',       phone: '9134567890', email: 'sanjay.mehta@mail.com',       gender: 'Male',   dob: '1999-07-07' },
  { name: 'Aarti Kapoor',       phone: '9245678901', email: 'aarti.kapoor@mail.com',       gender: 'Female', dob: '1984-10-22' },
  { name: 'Rajesh Pandey',      phone: '9356789012', email: 'rajesh.pandey@mail.com',      gender: 'Male',   dob: '1971-05-31' },
  { name: 'Seema Chatterjee',   phone: '9467890123', email: 'seema.chatterjee@mail.com',   gender: 'Female', dob: '1992-03-08' },
  { name: 'Prakash Iyer',       phone: '9578901234', email: 'prakash.iyer@mail.com',       gender: 'Male',   dob: '1986-09-14' },
  { name: 'Geeta Mishra',       phone: '9689012345', email: 'geeta.mishra@mail.com',       gender: 'Female', dob: '1979-06-26' },
  { name: 'Vivek Saxena',       phone: '9790123456', email: 'vivek.saxena@mail.com',       gender: 'Male',   dob: '2002-01-19' },
  { name: 'Poonam Srivastava',  phone: '9801234567', email: 'poonam.srivastava@mail.com',  gender: 'Female', dob: '1968-11-07' },
  { name: 'Ashok Kulkarni',     phone: '9912345678', email: 'ashok.kulkarni@mail.com',     gender: 'Male',   dob: '1977-04-03' },
  { name: 'Manjula Hegde',      phone: '9023456780', email: 'manjula.hegde@mail.com',      gender: 'Female', dob: '1990-08-21' },
  { name: 'Dinesh Choudhary',   phone: '9134567891', email: 'dinesh.choudhary@mail.com',   gender: 'Male',   dob: '1995-12-10' },
  { name: 'Radha Venkatesh',    phone: '9245678902', email: 'radha.venkatesh@mail.com',    gender: 'Female', dob: '1981-07-16' },
  { name: 'Harish Nambiar',     phone: '9356789013', email: 'harish.nambiar@mail.com',     gender: 'Male',   dob: '1993-02-04' },
  { name: 'Usha Balakrishnan',  phone: '9467890124', email: 'usha.balakrishnan@mail.com',  gender: 'Female', dob: '1975-10-28' },
  { name: 'Ganesh Rajan',       phone: '9578901235', email: 'ganesh.rajan@mail.com',       gender: 'Male',   dob: '1998-05-09' },
  { name: 'Lalitha Subramanian',phone: '9689012346', email: 'lalitha.s@mail.com',          gender: 'Female', dob: '1972-03-23' },
  { name: 'Mohan Narayanan',    phone: '9790123457', email: 'mohan.narayanan@mail.com',    gender: 'Male',   dob: '1985-09-30' },
  { name: 'Chitra Ramesh',      phone: '9801234568', email: 'chitra.ramesh@mail.com',      gender: 'Female', dob: '1997-06-15' },
  { name: 'Bala Krishnaswamy',  phone: '9912345679', email: 'bala.krishnaswamy@mail.com',  gender: 'Male',   dob: '1969-12-28' },
  { name: 'Vani Gopalan',       phone: '9023456781', email: 'vani.gopalan@mail.com',       gender: 'Female', dob: '1983-04-11' },
  { name: 'Mani Seshadri',      phone: '9134567892', email: 'mani.seshadri@mail.com',      gender: 'Male',   dob: '2000-08-05' },
  { name: 'Saritha Anand',      phone: '9245678903', email: 'saritha.anand@mail.com',      gender: 'Female', dob: '1976-01-17' },
  { name: 'Rajan Varghese',     phone: '9356789014', email: 'rajan.varghese@mail.com',     gender: 'Male',   dob: '1991-11-22' },
  { name: 'Nandini Kaur',       phone: '9467890125', email: 'nandini.kaur@mail.com',       gender: 'Female', dob: '1988-07-03' },
  { name: 'Sunil Bhatt',        phone: '9578901236', email: 'sunil.bhatt@mail.com',        gender: 'Male',   dob: '1974-03-18' },
  { name: 'Preethi Suresh',     phone: '9689012347', email: 'preethi.suresh@mail.com',     gender: 'Female', dob: '1996-10-31' },
  { name: 'Naveen Murthy',      phone: '9790123458', email: 'naveen.murthy@mail.com',      gender: 'Male',   dob: '1982-06-07' },
  { name: 'Sindhu Nair',        phone: '9801234569', email: 'sindhu.nair@mail.com',        gender: 'Female', dob: '1999-02-14' },
];

const PATIENTS_RAW = PATIENT_DATA.map((p, i) => ({
  patientId: `PAT-F${String(i + 1).padStart(3, '0')}`,
  name:      p.name,
  phone:     p.phone,
  email:     p.email,
  gender:    p.gender,
  dob:       p.dob,
  isActive:  true,
  createdAt: now,
  updatedAt: now,
}));

const APPOINTMENT_TYPES = ['Consultation', 'Follow-up', 'Routine Check-up', 'Emergency'];

const DISEASES = [
  'Chest Pain',     'Hypertension',    'Diabetes',       'Fever',
  'Knee Pain',      'Back Pain',       'Headache',       'Flu',
  'Arrhythmia',     'Migraine',        'Asthma',         'Fracture',
  'Skin Rash',      'Eye Infection',   'Ear Pain',       'Sore Throat',
  'Dizziness',      'Nausea',          'Abdominal Pain', 'Anxiety',
];

const TIMES = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
];

const PAST_DATES = [
  '2026-01-08', '2026-01-14', '2026-01-21', '2026-01-27',
  '2026-02-04', '2026-02-11', '2026-02-18', '2026-02-25',
  '2026-03-04', '2026-03-11', '2026-03-18', '2026-03-25',
  '2026-04-02', '2026-04-09', '2026-04-16', '2026-04-22',
];

const FUTURE_DATES = [
  '2026-04-28', '2026-04-29', '2026-04-30',
  '2026-05-05', '2026-05-07', '2026-05-12', '2026-05-14', '2026-05-19',
  '2026-05-21', '2026-05-26', '2026-05-28',
  '2026-06-02', '2026-06-04', '2026-06-09', '2026-06-11', '2026-06-16',
];

const buildAppointment = (idx, status) => {
  const docOffset  = status === 'Completed' ? 0  : status === 'Booked' ? 10 : 20;
  const patOffset  = status === 'Completed' ? 0  : status === 'Booked' ?  5 : 15;
  const dateList   = status === 'Booked' ? FUTURE_DATES : PAST_DATES;
  const dateOffset = status === 'Cancelled' ? 8 : 0;

  const doctor  = DOCTORS[(idx + docOffset) % 50];
  const patient = PATIENTS_RAW[(idx + patOffset) % 50];

  const seqMap = { Completed: idx + 1, Booked: idx + 41, Cancelled: idx + 81 };

  return {
    appointmentId:   `APT-F${String(seqMap[status]).padStart(5, '0')}`,
    patientId:       patient.patientId,
    patientName:     patient.name,
    doctorId:        doctor.doctorId,
    doctorName:      doctor.name,
    department:      doctor.department,
    appointmentType: APPOINTMENT_TYPES[idx % 4],
    disease:         DISEASES[idx % 20],
    appointmentDate: dateList[(idx + dateOffset) % 16],
    appointmentTime: TIMES[idx % 13],
    status,
    createdAt:       now,
    updatedAt:       now,
  };
};

const APPOINTMENTS_RAW = [
  ...Array.from({ length: 40 }, (_, i) => buildAppointment(i, 'Completed')),
  ...Array.from({ length: 40 }, (_, i) => buildAppointment(i, 'Booked')),
  ...Array.from({ length: 40 }, (_, i) => buildAppointment(i, 'Cancelled')),
];

const run = async () => {
  console.log('\nAppointment Booking POC — Prefilled Seed Data');
  console.log('══════════════════════════════════════════════════\n');

  const kmsEnabled = !!process.env.KMS_KEY_ARN;
  console.log(`KMS encryption : ${kmsEnabled ? 'ON  (KMS_KEY_ARN set)' : 'OFF (KMS_KEY_ARN not set — storing plaintext)'}\n`);

  console.log(`Doctors (poc_doctors) — ${DOCTORS.length} records`);
  for (const d of DOCTORS) {
    await putIfNotExists('poc_doctors', 'doctorId', d);
  }

  console.log(`\nPatients (poc_patients) — ${PATIENTS_RAW.length} records`);
  for (const p of PATIENTS_RAW) {
    const encrypted = await encryptItem(p, ['name', 'phone', 'email', 'dob']);
    await putIfNotExists('poc_patients', 'patientId', encrypted);
  }

  const completed = APPOINTMENTS_RAW.filter((a) => a.status === 'Completed').length;
  const booked    = APPOINTMENTS_RAW.filter((a) => a.status === 'Booked').length;
  const cancelled = APPOINTMENTS_RAW.filter((a) => a.status === 'Cancelled').length;
  console.log(`\nAppointments (poc_appointments) — ${APPOINTMENTS_RAW.length} records`);
  console.log(`   Completed: ${completed}  |  Booked: ${booked}  |  Cancelled: ${cancelled}`);
  for (const a of APPOINTMENTS_RAW) {
    const encrypted = await encryptItem(a, ['patientName']);
    await putIfNotExists('poc_appointments', 'appointmentId', encrypted);
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('Prefilled seed complete!\n');
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
