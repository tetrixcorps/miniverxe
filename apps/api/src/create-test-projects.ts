import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestProjects() {
  try {
    // Get the test organization
    const org = await prisma.organization.findUnique({
      where: { name: 'TestOrg' }
    });

    if (!org) {
      console.log('TestOrg not found, creating it...');
      const newOrg = await prisma.organization.create({
        data: { name: 'TestOrg' }
      });
      console.log('Created organization:', newOrg.name);
    }

    // Get the admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@test.org' }
    });

    if (!admin) {
      console.log('Admin user not found, creating it...');
      const passwordHash = await import('bcryptjs').then(bcrypt => bcrypt.hash('adminpassword', 10));
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@test.org',
          name: 'Admin User',
          passwordHash,
          isActive: true,
        }
      });
      console.log('Created admin user:', newAdmin.email);
    }

    // Create test projects
    const projects = [
      {
        name: 'Image Classification Alpha',
        description: 'Classify images into predefined categories for machine learning training',
        status: 'active',
      },
      {
        name: 'Text Sentiment Analysis',
        description: 'Analyze sentiment in customer feedback and reviews',
        status: 'active',
      },
      {
        name: 'Object Detection Beta',
        description: 'Detect and classify objects in video streams',
        status: 'draft',
      }
    ];

    for (const projectData of projects) {
      const existingProject = await prisma.project.findFirst({
        where: { name: projectData.name }
      });

      if (!existingProject) {
        const project = await prisma.project.create({
          data: {
            ...projectData,
            organizationId: org?.id || 'TestOrg',
            createdById: admin?.id || 'admin@test.org',
          }
        });
        console.log('Created project:', project.name);
      } else {
        console.log('Project already exists:', projectData.name);
      }
    }

    console.log('Test projects created successfully!');
  } catch (error) {
    console.error('Error creating test projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProjects(); 