import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany({
    where: { deleted_at: null }
  });
  console.log('--- SUBJECTS IN DATABASE ---');
  console.log('Total subjects:', subjects.length);
  
  const idCounts: Record<string, number> = {};
  subjects.forEach(s => {
    idCounts[s.id] = (idCounts[s.id] || 0) + 1;
  });
  
  const duplicateIds = Object.entries(idCounts).filter(([id, count]) => count > 1);
  console.log('Duplicate IDs:', duplicateIds);
  
  console.log('All subjects IDs & Codes:');
  subjects.forEach(s => {
    console.log(`- ID: ${s.id}, Code: ${s.code}, Name: ${s.name}`);
  });
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
});
