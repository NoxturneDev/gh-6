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

  console.log('✅ Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());