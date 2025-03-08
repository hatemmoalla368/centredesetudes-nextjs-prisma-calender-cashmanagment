const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.classroom.createMany({
    data: [
      { name: 'Classroom 1' },
      { name: 'Classroom 2' },
      { name: 'Classroom 3' },
    ],
  });

  console.log('Classrooms added!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
