import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Permissions
  const permissions = [
    { action: 'user.manage', description: 'Manage users' },
    { action: 'project.create', description: 'Create projects' },
    { action: 'project.edit', description: 'Edit projects' },
    { action: 'project.delete', description: 'Delete projects' },
    { action: 'task.create', description: 'Create tasks' },
    { action: 'task.assign', description: 'Assign tasks' },
    { action: 'task.view_all', description: 'View all tasks' },
    { action: 'task.view_assigned', description: 'View assigned tasks' },
    { action: 'annotation.create', description: 'Create annotations' },
    { action: 'annotation.review', description: 'Review annotations' },
    { action: 'data.export', description: 'Export data' },
    { action: 'system.settings', description: 'System settings' },
    { action: 'billing.view', description: 'View billing' },
    { action: 'billing.manage', description: 'Manage billing' },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      update: {},
      create: perm,
    })
  }

  // Roles
  const roles = [
    { name: 'Admin', description: 'System administrator' },
    { name: 'ProjectManager', description: 'Manages projects and teams' },
    { name: 'Reviewer', description: 'Reviews and approves annotations' },
    { name: 'Annotator', description: 'Performs data annotation tasks' },
    { name: 'BillingAdmin', description: 'Manages billing and invoices' },
    { name: 'Owner', description: 'Organization owner' },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }

  // Role-Permission assignments
  const rolePerms: Record<string, string[]> = {
    Admin: permissions.map(p => p.action),
    ProjectManager: [
      'project.create', 'project.edit', 'task.create', 'task.assign', 'task.view_all', 'annotation.create', 'annotation.review', 'data.export'
    ],
    Reviewer: [
      'task.view_all', 'annotation.review'
    ],
    Annotator: [
      'task.view_assigned', 'annotation.create'
    ],
    BillingAdmin: [
      'billing.view', 'billing.manage'
    ],
    Owner: [
      'user.manage', 'system.settings', 'project.create', 'project.edit', 'project.delete', 'task.create', 'task.assign', 'task.view_all', 'annotation.create', 'annotation.review', 'data.export', 'billing.view', 'billing.manage'
    ]
  }

  for (const [roleName, perms] of Object.entries(rolePerms)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    for (const permAction of perms) {
      const perm = await prisma.permission.findUnique({ where: { action: permAction } })
      if (role && perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        })
      }
    }
  }

  // Create a test organization
  const org = await prisma.organization.upsert({
    where: { name: 'TestOrg' },
    update: {},
    create: { name: 'TestOrg' },
  })

  // Create a test user (Admin)
  const passwordHash = await hash('adminpassword', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.org' },
    update: {},
    create: {
      email: 'admin@test.org',
      name: 'Admin User',
      passwordHash,
      isActive: true,
    },
  })

  // Link user to org
  await prisma.userOrganization.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: { userId: user.id, organizationId: org.id },
  })

  // Assign Admin and Owner roles to user in org
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } })
  const ownerRole = await prisma.role.findUnique({ where: { name: 'Owner' } })
  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId_organizationId: { userId: user.id, roleId: adminRole.id, organizationId: org.id } },
      update: {},
      create: { userId: user.id, roleId: adminRole.id, organizationId: org.id },
    })
  }
  if (ownerRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId_organizationId: { userId: user.id, roleId: ownerRole.id, organizationId: org.id } },
      update: {},
      create: { userId: user.id, roleId: ownerRole.id, organizationId: org.id },
    })
  }

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 