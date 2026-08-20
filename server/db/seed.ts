/**
 * MEDYX — synthetic demo seed data.
 *
 * ⚠ ALL DATA HERE IS FICTIONAL.
 * Names, emails, phone numbers and addresses are invented for demonstration.
 * No real person's personal information is used. Every row is flagged with
 * is_demo = TRUE and uses the reserved @demo.medyx.test email domain, which
 * cannot receive mail.
 */
import { closePool, withTransaction } from './pool.js';
import { hashPassword } from '../auth/password.js';

/** Shared password for every demo account. */
const DEMO_PASSWORD = 'MedyxDemo123';

const DEMO_PATIENTS = [
  { fullName: 'Demo Patient One', email: 'patient1@demo.medyx.test', phone: '+20 100 000 0001' },
  { fullName: 'Demo Patient Two', email: 'patient2@demo.medyx.test', phone: '+20 100 000 0002' },
  { fullName: 'Demo Patient Three', email: 'patient3@demo.medyx.test', phone: '+20 100 000 0003' },
];

const DEMO_PHARMACIES = [
  {
    ownerName: 'Demo Owner Alpha',
    email: 'pharmacy1@demo.medyx.test',
    phone: '+20 100 000 1001',
    pharmacyName: 'Demo Nile Care Pharmacy',
    address: '12 Demo Street, Zamalek, Cairo',
    latitude: 30.0625,
    longitude: 31.2205,
    verified: true,
  },
  {
    ownerName: 'Demo Owner Beta',
    email: 'pharmacy2@demo.medyx.test',
    phone: '+20 100 000 1002',
    pharmacyName: 'Demo Heliopolis Medical Pharmacy',
    address: '48 Demo Avenue, Heliopolis, Cairo',
    latitude: 30.0808,
    longitude: 31.322,
    verified: true,
  },
  {
    ownerName: 'Demo Owner Gamma',
    email: 'pharmacy3@demo.medyx.test',
    phone: '+20 100 000 1003',
    pharmacyName: 'Demo Maadi Riverside Pharmacy',
    address: '7 Demo Corniche, Maadi, Cairo',
    latitude: 29.9603,
    longitude: 31.2569,
    verified: false,
  },
];

const DEMO_ADMIN = {
  fullName: 'Demo Administrator',
  email: 'admin@demo.medyx.test',
  phone: '+20 100 000 9999',
};

async function seed() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await withTransaction(async (client) => {
    // Idempotent: clear previous demo rows only. Real accounts are untouched.
    await client.query('DELETE FROM users WHERE is_demo = TRUE');

    for (const p of DEMO_PATIENTS) {
      await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_demo)
         VALUES ($1, $2, $3, $4, 'patient', TRUE)`,
        [p.fullName, p.email, p.phone, passwordHash],
      );
    }

    for (const ph of DEMO_PHARMACIES) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_demo)
         VALUES ($1, $2, $3, $4, 'pharmacy', TRUE)
         RETURNING id`,
        [ph.ownerName, ph.email, ph.phone, passwordHash],
      );
      await client.query(
        `INSERT INTO pharmacies
           (owner_user_id, name, phone, address, latitude, longitude, verified, is_demo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
        [
          rows[0].id,
          ph.pharmacyName,
          ph.phone,
          ph.address,
          ph.latitude,
          ph.longitude,
          ph.verified,
        ],
      );
    }

    await client.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, is_demo)
       VALUES ($1, $2, $3, $4, 'admin', TRUE)`,
      [DEMO_ADMIN.fullName, DEMO_ADMIN.email, DEMO_ADMIN.phone, passwordHash],
    );
  });

  console.log('Seeded synthetic demo data:');
  console.log(`  ${DEMO_PATIENTS.length} patients, ${DEMO_PHARMACIES.length} pharmacies, 1 admin`);
  console.log(`  Shared demo password: ${DEMO_PASSWORD}`);
  console.log('  All rows flagged is_demo = TRUE on the @demo.medyx.test domain.');
}

seed()
  .catch((err) => {
    console.error('[seed] failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => closePool());
