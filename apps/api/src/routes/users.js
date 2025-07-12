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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const rbac_2 = require("@tetrix/rbac");
const validation_1 = require("../middleware/validation");
const zod_1 = require("zod");
// import prisma from '../prisma'; // Uncomment and adjust import as needed
const router = (0, express_1.Router)();
// Apply auth middleware to all user routes
router.use(auth_1.firebaseAuthMiddleware);
// GET /api/users - List all users (admin only)
router.get('/', (0, rbac_1.requirePermission)(rbac_2.Permissions.UserList), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const users = await prisma.user.findMany();
        // res.json(users);
        res.json([{ id: 'user1', email: 'demo@example.com', roles: ['admin'] }]); // Placeholder
    }
    catch (err) {
        next(err);
    }
}));
// GET /api/users/:id - Get user profile (self or admin)
router.get('/:id', (0, rbac_1.requirePermission)(rbac_2.Permissions.UserRead), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // const user = await prisma.user.findUnique({ where: { id } });
        // if (!user) return res.status(404).json({ error: 'User not found' });
        // if (req.user.id !== id && !req.user.roles.includes('admin')) return res.status(403).json({ error: 'Forbidden' });
        // res.json(user);
        res.json({ id, email: 'demo@example.com', roles: ['user'] }); // Placeholder
    }
    catch (err) {
        next(err);
    }
}));
// PATCH /api/users/:id - Update user profile (name, etc.)
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
});
router.patch('/:id', (0, rbac_1.requirePermission)(rbac_2.Permissions.UserUpdate), (0, validation_1.validateBody)(updateUserSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        // const user = await prisma.user.update({ where: { id }, data });
        // res.json(user);
        res.json(Object.assign({ id }, data)); // Placeholder
    }
    catch (err) {
        next(err);
    }
}));
// PATCH /api/users/:id/role - Update user role (admin only)
router.patch('/:id/role', (0, rbac_1.requirePermission)(rbac_2.Permissions.UserRoleUpdate), (req, res) => {
    // TODO: Implement update user role (admin only)
    res.json({ message: 'Update user role (admin only)' });
});
exports.default = router;
