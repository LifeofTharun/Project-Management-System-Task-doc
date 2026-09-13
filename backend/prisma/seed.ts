import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('Password123!', 12);
  const user = await prisma.user.create({
    data: {
      fullName: 'Tharun Kumar',
      email: 'demo@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`👤 Created user: ${user.fullName} (${user.email})`);

  // Create Sample Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform Redesign',
      description: 'Revamping the storefront with modern UI/UX, Next.js, and Stripe payment gateway.',
      status: 'In Progress',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-10-30'),
      userId: user.id
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile Banking App API',
      description: 'Building secure microservices for biometric authentication, transfers, and statements.',
      status: 'Not Started',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-15'),
      userId: user.id
    }
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'AI Customer Support Bot',
      description: 'Deploying LLM-driven automated ticket resolution assistant for enterprise clients.',
      status: 'Completed',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-08-30'),
      userId: user.id
    }
  });

  // Create Sample Tasks
  await prisma.task.createMany({
    data: [
      {
        name: 'Design high-fidelity Figma mockups',
        description: 'Complete UI mockups for product listing, cart, and checkout pages.',
        priority: 'High',
        status: 'Completed',
        dueDate: new Date('2026-09-10'),
        projectId: project1.id,
        userId: user.id
      },
      {
        name: 'Implement JWT & OAuth Authentication',
        description: 'Set up access tokens, refresh tokens, and rate-limiting security middleware.',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date('2026-09-20'),
        projectId: project1.id,
        userId: user.id
      },
      {
        name: 'Integrate Stripe Webhook Listeners',
        description: 'Handle payment succeed and subscription update webhook events securely.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date('2026-09-28'),
        projectId: project1.id,
        userId: user.id
      },
      {
        name: 'Define PostgreSQL Schema & Prisma migrations',
        description: 'Design accounts, transactions, and audit tables with foreign keys.',
        priority: 'High',
        status: 'Pending',
        dueDate: new Date('2026-10-10'),
        projectId: project2.id,
        userId: user.id
      },
      {
        name: 'Setup Docker Compose for Local Development',
        description: 'Containerize PostgreSQL, Redis, and Express API services.',
        priority: 'Low',
        status: 'Pending',
        dueDate: new Date('2026-10-15'),
        projectId: project2.id,
        userId: user.id
      },
      {
        name: 'Prompt Engineering & Fine-tuning Dataset',
        description: 'Curate 1,000 domain-specific customer inquiries for model alignment.',
        priority: 'Medium',
        status: 'Completed',
        dueDate: new Date('2026-08-15'),
        projectId: project3.id,
        userId: user.id
      }
    ]
  });

  // Create Sample Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'AUTH',
        entityId: user.id,
        details: JSON.stringify({ email: user.email })
      },
      {
        userId: user.id,
        action: 'CREATE_PROJECT',
        entityType: 'PROJECT',
        entityId: project1.id,
        details: JSON.stringify({ name: project1.name, status: project1.status })
      },
      {
        userId: user.id,
        action: 'CREATE_PROJECT',
        entityType: 'PROJECT',
        entityId: project2.id,
        details: JSON.stringify({ name: project2.name, status: project2.status })
      }
    ]
  });

  console.log('✅ Seed completed successfully with projects, tasks, and audit logs!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
