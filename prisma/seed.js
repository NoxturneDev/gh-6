// You can place this file in prisma/seed.js
// Then run with the command: npx prisma db seed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log(`Starting the seeding process...`);

  // --- 1. Seed Users ---
  console.log('Seeding users...');
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      // It's better to handle password hashing in your app logic,
      // but for a seeder, a pre-hashed password is fine.
      password: '$2a$10$x9sqjrUc.o4EEBnWGk2iF.r7iplqXWPi460BhDdIF3J.mPg07Vkpe', // password is "password"
      role: 1 // Using Enum value
    }
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: '$2a$10$x9sqjrUc.o4EEBnWGk2iF.r7iplqXWPi460BhDdIF3J.mPg07Vkpe', // password is "password"
      role: 0,
      name: 'Regular User'
    }
  });
  console.log('Users have been seeded.');

  // --- 2. Seed Regions ---
  console.log('Seeding regions...');
  const regionData = [
    { id: 1, name: 'Jawa', description: 'Pulau utama dengan populasi terbesar.' },
    { id: 2, name: 'Sumatra', description: 'Pulau di ujung barat Indonesia.' },
    { id: 3, name: 'Kalimantan', description: 'Pulau dengan banyak hutan tropis dan keanekaragaman hayati.' },
    { id: 4, name: 'Sulawesi', description: 'Dikenal dengan bentuknya yang unik seperti huruf K.' },
    { id: 5, name: 'Papua', description: 'Wilayah paling timur Indonesia dengan kekayaan alam yang melimpah.' },
    { id: 6, name: 'Nusa Tenggara', description: 'Wilayah paling timur Indonesia dengan kekayaan alam yang melimpah.' },
  ];

  for (const data of regionData) {
    const region = await prisma.region.upsert({
      where: { id: data.id },
      update: {}, // If it exists, do nothing
      create: data, // If it doesn't exist, create it
    });
    console.log(`Seeded region: ${region.name} (ID: ${region.id})`);
  }
  console.log('Regions have been seeded.');

  // --- 3. Seed Region Details ---
  console.log('Seeding region details...');
  // Using upsert for each detail to prevent errors on re-running the seed.
  await prisma.regionDetail.upsert({
    where: { regionId: 1 },
    update: {},
    create: {
      regionId: 1, // Jawa
      educationStatus: 2,
      sekolahNegeri: 500,
      sekolahSwasta: 300,
      sdInSchool: 200000,
      sdOutSchool: 10000,
      smpInSchool: 180000,
      smpOutSchool: 12000,
      smaInSchool: 150000,
      smaOutSchool: 20000,
      teacherCount: 25000
    }
  });
  await prisma.regionDetail.upsert({
    where: { regionId: 3 },
    update: {},
    create: {
      regionId: 3, // Kalimantan
      educationStatus: 1,
      sekolahNegeri: 200,
      sekolahSwasta: 150,
      sdInSchool: 90000,
      sdOutSchool: 15000,
      smpInSchool: 80000,
      smpOutSchool: 20000,
      smaInSchool: 60000,
      smaOutSchool: 25000,
      teacherCount: 12000
    }
  });
  await prisma.regionDetail.upsert({
    where: { regionId: 2 },
    update: {},
    create: {
      regionId: 2, // Kalimantan
      educationStatus: 1,
      sekolahNegeri: 200,
      sekolahSwasta: 150,
      sdInSchool: 90000,
      sdOutSchool: 15000,
      smpInSchool: 80000,
      smpOutSchool: 20000,
      smaInSchool: 60000,
      smaOutSchool: 25000,
      teacherCount: 12000
    }
  });
  await prisma.regionDetail.upsert({
    where: { regionId: 5 },
    update: {},
    create: {
      regionId: 5, // Kalimantan
      educationStatus: 1,
      sekolahNegeri: 200,
      sekolahSwasta: 150,
      sdInSchool: 90000,
      sdOutSchool: 15000,
      smpInSchool: 80000,
      smpOutSchool: 20000,
      smaInSchool: 60000,
      smaOutSchool: 25000,
      teacherCount: 12000
    }
  });
  await prisma.regionDetail.upsert({
    where: { regionId: 4 },
    update: {},
    create: {
      regionId: 4, // Kalimantan
      educationStatus: 2,
      sekolahNegeri: 200,
      sekolahSwasta: 150,
      sdInSchool: 90000,
      sdOutSchool: 15000,
      smpInSchool: 80000,
      smpOutSchool: 20000,
      smaInSchool: 60000,
      smaOutSchool: 25000,
      teacherCount: 12000
    }
  });
  console.log('Region details have been seeded.');

  // --- 4. Seed Donations (Optional, as an example) ---
  console.log('Seeding donations...');
  // For re-runnable seeds, it's good practice to clean up non-unique data.
  await prisma.donation.deleteMany({});
  await prisma.donation.createMany({
    data: [
      {
        donorName: 'Budi',
        amount: 100000,
        message: 'Semoga bermanfaat',
        regionId: 1, // Donasi untuk Jawa
        paymentStatus: 1,
      },
      {
        donorName: 'Siti',
        amount: 250000,
        message: 'Untuk pendidikan di Kalimantan',
        regionId: 3, // Donasi untuk Kalimantan
        paymentStatus: 0,
      }
    ]
  });
  console.log('Donations have been seeded.');

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error("An error occurred during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
