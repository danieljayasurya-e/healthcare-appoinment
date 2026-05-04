import { KMSClient, GenerateDataKeyCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const kmsClient = new KMSClient({ region: process.env.AWS_REGION });
const KEY_ARN   = process.env.KMS_KEY_ARN;
const ALGO      = 'aes-256-gcm';

export const encryptItem = async (item, fields) => {
  if (!KEY_ARN) return item;

  const { Plaintext, CiphertextBlob } = await kmsClient.send(
    new GenerateDataKeyCommand({ KeyId: KEY_ARN, KeySpec: 'AES_256' })
  );

  const dataKey      = Buffer.from(Plaintext);
  const encryptedKey = Buffer.from(CiphertextBlob).toString('base64');

  const out    = { ...item };
  const ivMap  = {};
  const tagMap = {};
  const encrypted = [];

  for (const field of fields) {
    const val = item[field];
    if (val === undefined || val === null || val === '') continue;

    const iv     = randomBytes(12);
    const cipher = createCipheriv(ALGO, dataKey, iv);
    const enc    = Buffer.concat([cipher.update(String(val), 'utf8'), cipher.final()]);

    out[field]    = enc.toString('base64');
    ivMap[field]  = iv.toString('base64');
    tagMap[field] = cipher.getAuthTag().toString('base64');
    encrypted.push(field);
  }

  dataKey.fill(0);

  out._encryptedDataKey  = encryptedKey;
  out._ivMap             = ivMap;
  out._tagMap            = tagMap;
  out._encryptedFields   = encrypted;

  return out;
};

export const decryptItem = async (item) => {
  if (!item?._encryptedDataKey || !KEY_ARN) return item;

  const { Plaintext } = await kmsClient.send(
    new DecryptCommand({
      KeyId:          KEY_ARN,
      CiphertextBlob: Buffer.from(item._encryptedDataKey, 'base64'),
    })
  );

  const dataKey = Buffer.from(Plaintext);
  const out     = { ...item };

  for (const field of (item._encryptedFields ?? [])) {
    const iv  = item._ivMap?.[field];
    const tag = item._tagMap?.[field];
    if (!iv || !tag) continue;

    const decipher = createDecipheriv(ALGO, dataKey, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(item[field], 'base64')),
      decipher.final(),
    ]);
    out[field] = dec.toString('utf8');
  }

  dataKey.fill(0);

  delete out._encryptedDataKey;
  delete out._ivMap;
  delete out._tagMap;
  delete out._encryptedFields;

  return out;
};

export const decryptItems = async (items) => Promise.all(items.map(decryptItem));
