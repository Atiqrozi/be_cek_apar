import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import * as argon2 from 'argon2';

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const contents = readFileSync(envPath, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  } catch {
    // Environment variables may be provided by the shell or deployment platform.
  }
}

async function provisionAdmin(): Promise<void> {
  loadEnvFile();
  const mongoUri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const employeeId = process.env.ADMIN_EMPLOYEE_ID?.trim();
  const fullName = process.env.ADMIN_FULL_NAME?.trim();

  if (!mongoUri) throw new Error('MONGODB_URI wajib diisi melalui .env atau environment variable.');
  if (!email || !email.includes('@')) throw new Error('ADMIN_EMAIL wajib berupa email yang valid.');
  if (!password || password.length < 8) throw new Error('ADMIN_PASSWORD wajib memiliki minimal 8 karakter.');
  if (!employeeId) throw new Error('ADMIN_EMPLOYEE_ID wajib diisi.');
  if (!fullName) throw new Error('ADMIN_FULL_NAME wajib diisi.');

  await mongoose.connect(mongoUri);
  const userModel = mongoose.model('User', new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    role: { type: String, required: true, enum: ['admin', 'inspector', 'viewer'] },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true, collection: 'users' }));

  const existing = await userModel.findOne({ $or: [{ email }, { employeeId }] }).select('email employeeId').lean();
  if (existing) {
    throw new Error('Akun dengan email atau employee ID tersebut sudah ada. Tidak ada perubahan yang dilakukan.');
  }

  await userModel.create({
    fullName,
    email,
    employeeId,
    role: 'admin',
    passwordHash: await argon2.hash(password),
    isActive: true,
  });
  console.log(`Akun admin ${email} berhasil dibuat.`);
}

provisionAdmin()
  .catch(error => {
    console.error(error instanceof Error ? error.message : 'Provisioning gagal.');
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
