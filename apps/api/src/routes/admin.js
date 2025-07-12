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
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const rbac_2 = require("@tetrix/rbac");
const zod_1 = require("zod");
const validation_1 = require("../middleware/validation");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_1 = require("../firebase"); // Firestore instance
const router = (0, express_1.Router)();
// Apply auth middleware to all admin routes
router.use(auth_1.firebaseAuthMiddleware);
// POST /api/admin/login
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Implement admin login logic
        res.json({ message: 'Admin login endpoint' });
    }
    catch (err) {
        next(err);
    }
}));
// GET /api/admin/contact-submissions (admin only)
router.get('/contact-submissions', (0, rbac_1.requirePermission)(rbac_2.Permissions.AdminContactRead), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Implement list contact submissions
        res.json([{ id: 'contact1', name: 'Alice', message: 'Hi' }]); // Placeholder
    }
    catch (err) {
        next(err);
    }
}));
// PATCH /api/admin/contact-submissions (admin only)
const updateContactSchema = zod_1.z.object({
    id: zod_1.z.string(),
    status: zod_1.z.enum(['open', 'closed']),
});
router.patch('/contact-submissions', (0, rbac_1.requirePermission)(rbac_2.Permissions.AdminContactUpdate), (0, validation_1.validateBody)(updateContactSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, status } = req.body;
        // TODO: Update contact submission status
        res.json({ id, status }); // Placeholder
    }
    catch (err) {
        next(err);
    }
}));
// POST /api/admin/logout
router.post('/logout', (0, rbac_1.requirePermission)(rbac_2.Permissions.AdminLogout), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Implement admin logout logic
        res.json({ message: 'Admin logout endpoint' });
    }
    catch (err) {
        next(err);
    }
}));
// Middleware to check SuperAdmin role
function requireSuperAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers.authorization;
            if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
                return res.status(401).json({ error: "Missing or invalid Authorization header" });
            }
            const token = authHeader.replace("Bearer ", "");
            const decoded = yield firebase_admin_1.default.auth().verifyIdToken(token);
            if (!decoded.roles || !decoded.roles.includes("SuperAdmin")) {
                return res.status(403).json({ error: "Forbidden: SuperAdmin role required" });
            }
            req.user = decoded;
            next();
        }
        catch (err) {
            res.status(401).json({ error: "Invalid or expired token" });
        }
    });
}
// POST /api/admin/promote-to-labeler
router.post("/promote-to-labeler", requireSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.body;
    if (!uid)
        return res.status(400).json({ error: "Missing uid" });
    try {
        // 1. Update Firestore user profile
        yield firebase_1.db.collection("users").doc(uid).update({ role: "Labeler" });
        // 2. Update Firebase custom claims
        yield firebase_admin_1.default.auth().setCustomUserClaims(uid, { roles: ["Labeler"] });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
