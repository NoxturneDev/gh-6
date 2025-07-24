const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: "admin",
      email: 'admin@example.com',
      password: '$2a$10$x9sqjrUc.o4EEBnWGk2iF.r7iplqXWPi460BhDdIF3J.mPg07Vkpe',
      role: 1
    }
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: "user",
      email: 'user@example.com',
      password: 'hashed_user_password', // Replace with actual hashed password
      role: 0 // user
    }
  });

  // Seed Regions
  const regions = await prisma.region.createMany({
    data: [
      { name: 'Jawa', description: 'Pulau utama dengan populasi terbesar' },
      { name: 'Kalimantan', description: 'Pulau dengan banyak hutan tropis' },
      { name: 'Papua', description: 'Wilayah paling timur Indonesia' },
    ],
    skipDuplicates: true
  });

  // Seed Donations
  await prisma.donation.createMany({
    data: [
      {
        donorName: 'Budi',
        amount: 100000,
        message: 'Semoga bermanfaat',
        regionId: 1,
        paymentStatus: 1 // success
      },
      {
        donorName: 'Siti',
        amount: 250000,
        message: 'Untuk pendidikan di Papua',
        regionId: 3,
        paymentStatus: 0 // pending
      }
    ]
  });
  // Seed RegionDetail
  await prisma.regionDetail.createMany({
    data: [
      {
        regionId: 1,
        educationStatus: 2, // 2: baik
        sekolahNegeri: 500,
        sekolahSwasta: 300,
        sdInSchool: 200000,
        sdOutSchool: 10000,
        smpInSchool: 180000,
        smpOutSchool: 12000,
        smaInSchool: 150000,
        smaOutSchool: 20000,
        teacherCount: 25000
      },
      {
        regionId: kalimantan.id,
        educationStatus: 2, // 1: terbelakang
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
    ]
  });

  // Seed RegionClassification
  await prisma.regionClassification.createMany({
    data: [
      { regionId: jawa.id, type: 'fasilitas' },
      { regionId: jawa.id, type: 'tenaga_pendidik' },
      { regionId: kalimantan.id, type: 'akses_transportasi' },
      { regionId: kalimantan.id, type: 'infrastruktur' },
      { regionId: kalimantan.id, type: 'fasilitas' }
    ]
  });

  console.log('✅ Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
