"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new prisma_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create roles
        const roles = [
            { name: 'Admin', description: 'Platform administrator' },
            { name: 'Reviewer', description: 'QA reviewer' },
            { name: 'Labeler', description: 'Data labeler' },
            { name: 'BillingAdmin', description: 'Billing administrator' },
            { name: 'Owner', description: 'Organization owner' },
        ];
        for (const role of roles) {
            yield prisma.role.upsert({
                where: { name: role.name },
                update: {},
                create: role,
            });
        }
        // Create permissions
        const permissions = [
            { action: 'task.assign', description: 'Assign tasks' },
            { action: 'project.create', description: 'Create projects' },
            { action: 'billing.view', description: 'View billing' },
            { action: 'label.submit', description: 'Submit labels' },
            { action: 'review.approve', description: 'Approve reviews' },
        ];
        for (const perm of permissions) {
            yield prisma.permission.upsert({
                where: { action: perm.action },
                update: {},
                create: perm,
            });
        }
        // Create demo organization
        const org = yield prisma.organization.upsert({
            where: { name: 'DemoOrg' },
            update: {},
            create: { name: 'DemoOrg' },
        });
        // Create demo user (admin)
        const passwordHash = yield bcryptjs_1.default.hash('admin123', 10);
        const user = yield prisma.user.upsert({
            where: { email: 'admin@demo.org' },
            update: {},
            create: {
                email: 'admin@demo.org',
                name: 'Demo Admin',
                passwordHash,
                isActive: true,
                userOrganizations: {
                    create: { organizationId: org.id },
                },
            },
        });
        // Assign Admin role to demo user in DemoOrg
        const adminRole = yield prisma.role.findUnique({ where: { name: 'Admin' } });
        if (adminRole) {
            yield prisma.userRole.upsert({
                where: {
                    userId_roleId_organizationId: {
                        userId: user.id,
                        roleId: adminRole.id,
                        organizationId: org.id,
                    },
                },
                update: {},
                create: {
                    userId: user.id,
                    roleId: adminRole.id,
                    organizationId: org.id,
                },
            });
        }
        console.log('Seed complete!');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
