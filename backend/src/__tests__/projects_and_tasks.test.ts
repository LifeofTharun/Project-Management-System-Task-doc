import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

describe('Projects and Tasks API Tests with Authorization Guards', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let createdProjectId: string;
  let createdTaskId: string;

  beforeAll(async () => {
    // Create User 1
    const res1 = await request(app).post('/api/auth/register').send({
      fullName: 'Alice Developer',
      email: `alice_${Date.now()}@test.com`,
      password: 'Password123!'
    });
    user1Token = res1.body.data.token;
    user1Id = res1.body.data.user.id;

    // Create User 2
    const res2 = await request(app).post('/api/auth/register').send({
      fullName: 'Bob Hacker',
      email: `bob_${Date.now()}@test.com`,
      password: 'Password123!'
    });
    user2Token = res2.body.data.token;
    user2Id = res2.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { userId: { in: [user1Id, user2Id] } } });
    await prisma.project.deleteMany({ where: { userId: { in: [user1Id, user2Id] } } });
    await prisma.auditLog.deleteMany({ where: { userId: { in: [user1Id, user2Id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [user1Id, user2Id] } } });
    await prisma.$disconnect();
  });

  it('User 1 creates a project (201)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Alice Secret Project',
        description: 'Classified AI project',
        status: 'In Progress',
        startDate: '2026-01-01',
        endDate: '2026-12-31'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Alice Secret Project');
    createdProjectId = res.body.data.id;
  });

  it('User 1 creates a task inside the project (201)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Build Neural Engine',
        description: 'Core ML architecture',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-06-01',
        projectId: createdProjectId
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Build Neural Engine');
    createdTaskId = res.body.data.id;
  });

  it('User 2 should NOT be able to access User 1 project (403)', async () => {
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('User 2 should NOT be able to modify User 1 task (403)', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'Hacked Task Name'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('User 1 updates task status to Completed (200)', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        status: 'Completed'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Completed');
  });

  it('User 1 searches and filters projects (200)', async () => {
    const res = await request(app)
      .get('/api/projects?search=Secret&status=In%20Progress')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Alice Secret Project');
  });

  it('Dashboard returns correct dynamic metrics for User 1 (200)', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalProjects).toBe(1);
    expect(res.body.data.totalTasks).toBe(1);
    expect(res.body.data.completedTasks).toBe(1);
    expect(res.body.data.taskCompletionRate).toBe(100);
  });
});
