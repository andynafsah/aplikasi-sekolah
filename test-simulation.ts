import { PrismaEngine } from './src/backend/database/prisma';

async function test() {
  console.log('Initial subjects count:', await PrismaEngine.subject.count());
  
  const existing1 = await PrismaEngine.subject.findUnique({ where: { id: 'sub-fis' } });
  console.log('existing1:', existing1);
  
  if (!existing1) {
    await PrismaEngine.subject.create({
      data: { id: 'sub-fis', name: 'Fisika', code: 'FIS', kkm: 75, tenant_id: 'tenant-1' }
    });
  }
  
  console.log('Subjects count after 1st create:', await PrismaEngine.subject.count());
  
  const existing2 = await PrismaEngine.subject.findUnique({ where: { id: 'sub-fis' } });
  console.log('existing2:', existing2);
  
  if (!existing2) {
    await PrismaEngine.subject.create({
      data: { id: 'sub-fis', name: 'Fisika', code: 'FIS', kkm: 75, tenant_id: 'tenant-1' }
    });
  }
  
  console.log('Subjects count after 2nd check:', await PrismaEngine.subject.count());
  
  const allSubs = await PrismaEngine.subject.findMany();
  console.log('All subjects:', allSubs.map(s => ({ id: s.id, name: s.name })));
}

test().catch(err => console.error(err));
