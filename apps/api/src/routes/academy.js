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
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
// import { authGuard, requireRole } from '../middleware/auth'; // Uncomment and adjust as needed
const router = (0, express_1.Router)();
// --- Zod Schemas ---
const AssignmentSubmitSchema = zod_1.z.object({
    fileUrl: zod_1.z.string().url(),
    comment: zod_1.z.string().optional(),
    assignmentId: zod_1.z.string(),
});
const ReviewSchema = zod_1.z.object({
    status: zod_1.z.enum(['approved', 'rejected']),
    reviewComment: zod_1.z.string().optional(),
});
// --- Endpoints ---
// Submit assignment
router.post('/assignments', /*authGuard,*/ (0, validate_1.validateBody)(AssignmentSubmitSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileUrl, comment, assignmentId } = req.validatedBody;
    try {
        // TODO: Implement business logic to store assignment submission
        res.status(201).json({ ok: true, assignmentId });
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message, code: 'internal_error' });
    }
}));
// List assignments (for student)
router.get('/assignments', /*authGuard,*/ (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Fetch assignments for the authenticated user
        res.json([]); // Placeholder
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message, code: 'internal_error' });
    }
}));
// List assignments needing review (for reviewer)
router.get('/review-queue', /*authGuard, requireRole('AcademyReviewer'),*/ (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Fetch assignments needing review
        res.json([]); // Placeholder
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message, code: 'internal_error' });
    }
}));
// Review assignment
router.patch('/review/:id', /*authGuard, requireRole('AcademyReviewer'),*/ (0, validate_1.validateBody)(ReviewSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, reviewComment } = req.validatedBody;
    const { id } = req.params;
    try {
        // TODO: Update assignment review status
        res.json({ ok: true, id, status });
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message, code: 'internal_error' });
    }
}));
// List CI results
router.get('/ci', /*authGuard,*/ (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Fetch CI results for the authenticated user
        res.json([]); // Placeholder
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: message, code: 'internal_error' });
    }
}));
exports.default = router;
