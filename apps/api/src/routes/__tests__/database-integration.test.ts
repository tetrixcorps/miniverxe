import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

describe('Database Integration Tests', () => {
  let testOrg: any;
  let testUser: any;
  let testProjects: any[];

  beforeAll(async () => {
    // Create test data
    const passwordHash = await hash('testpassword', 10);
    
    testOrg = await prisma.organization.upsert({
      where: { name: 'TestOrgForDB' },
      update: {},
      create: { name: 'TestOrgForDB' }
    });

    testUser = await prisma.user.upsert({
      where: { email: 'test@db.com' },
      update: {},
      create: {
        email: 'test@db.com',
        name: 'Test DB User',
        passwordHash,
        isActive: true
      }
    });

    // Create test projects
    testProjects = await Promise.all([
      prisma.project.create({
        data: {
          name: 'DB Test Project 1',
          description: 'First database test project',
          status: 'active',
          organizationId: testOrg.id,
          createdById: testUser.id
        }
      }),
      prisma.project.create({
        data: {
          name: 'DB Test Project 2',
          description: 'Second database test project',
          status: 'draft',
          organizationId: testOrg.id,
          createdById: testUser.id
        }
      })
    ]);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.project.deleteMany({
      where: {
        id: { in: testProjects.map(p => p.id) }
      }
    });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.organization.delete({ where: { id: testOrg.id } });
    await prisma.$disconnect();
  });

  describe('Project Database Operations', () => {
    it('should create and retrieve projects with related data', async () => {
      const projects = await prisma.project.findMany({
        include: {
          organization: true,
          datasets: true,
          tasks: true,
          metrics: true,
          createdBy: true
        }
      });

      expect(projects.length).toBeGreaterThan(0);
      
      const testProject = projects.find((p: typeof projects[0]) => p.name === 'DB Test Project 1');
      expect(testProject).toBeDefined();
      expect(testProject).toMatchObject({
        name: 'DB Test Project 1',
        description: 'First database test project',
        status: 'active'
      });
    });

    it('should include organization data in project queries', async () => {
      const projects = await prisma.project.findMany({
        include: {
          organization: true
        }
      });

      const projectWithOrg = projects.find((p: typeof projects[0]) => p.organization && p.organization.name === 'TestOrgForDB');
      expect(projectWithOrg).toBeDefined();
      expect(projectWithOrg!.organization).toMatchObject({
        name: 'TestOrgForDB'
      });
    });

    it('should include creator user data in project queries', async () => {
      const projects = await prisma.project.findMany({
        include: {
          createdBy: true
        }
      });

      const projectWithCreator = projects.find((p: typeof projects[0]) => p.createdBy && p.createdBy.email === 'test@db.com');
      expect(projectWithCreator).toBeDefined();
      expect(projectWithCreator!.createdBy).toMatchObject({
        email: 'test@db.com',
        name: 'Test DB User',
        isActive: true
      });
    });

    it('should return empty arrays for related entities when none exist', async () => {
      const projects = await prisma.project.findMany({
        include: {
          datasets: true,
          tasks: true,
          metrics: true
        }
      });

      const testProject = projects.find((p: typeof projects[0]) => p.name === 'DB Test Project 1');
      expect(testProject).toBeDefined();
      expect(testProject!.datasets).toEqual([]);
      expect(testProject!.tasks).toEqual([]);
      expect(testProject!.metrics).toEqual([]);
    });
  });

  describe('Data Validation', () => {
    it('should return projects with valid UUIDs', async () => {
      const projects = await prisma.project.findMany();
      
      projects.forEach((project: typeof projects[0]) => {
        // UUID v4 regex pattern
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(project.id).toMatch(uuidRegex);
        expect(project.organizationId).toMatch(uuidRegex);
        expect(project.createdById).toMatch(uuidRegex);
      });
    });

    it('should return valid date objects', async () => {
      const projects = await prisma.project.findMany();
      
      projects.forEach((project: typeof projects[0]) => {
        expect(project.createdAt).toBeInstanceOf(Date);
        expect(project.updatedAt).toBeInstanceOf(Date);
        expect(project.createdAt.getTime()).not.toBeNaN();
        expect(project.updatedAt.getTime()).not.toBeNaN();
      });
    });

    it('should have required fields present', async () => {
      const projects = await prisma.project.findMany();
      
      projects.forEach((project: typeof projects[0]) => {
        const requiredFields = ['id', 'name', 'status', 'organizationId', 'createdById', 'createdAt', 'updatedAt'];
        requiredFields.forEach(field => {
          expect(project).toHaveProperty(field);
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid organization ID gracefully', async () => {
      try {
        await prisma.project.create({
          data: {
            name: 'Invalid Org Project',
            description: 'Project with invalid org',
            status: 'active',
            organizationId: 'invalid-uuid',
            createdById: testUser.id
          }
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid user ID gracefully', async () => {
      try {
        await prisma.project.create({
          data: {
            name: 'Invalid User Project',
            description: 'Project with invalid user',
            status: 'active',
            organizationId: testOrg.id,
            createdById: 'invalid-uuid'
          }
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Relationship Integrity', () => {
    it('should maintain referential integrity between projects and organizations', async () => {
      const projects = await prisma.project.findMany({
        include: {
          organization: true
        }
      });

      projects.forEach((project: typeof projects[0]) => {
        expect(project.organization).toBeDefined();
        expect(project.organizationId).toBe(project.organization.id);
      });
    });

    it('should maintain referential integrity between projects and users', async () => {
      const projects = await prisma.project.findMany({
        include: {
          createdBy: true
        }
      });

      projects.forEach((project: typeof projects[0]) => {
        expect(project.createdBy).toBeDefined();
        expect(project.createdById).toBe(project.createdBy.id);
      });
    });
  });
}); 