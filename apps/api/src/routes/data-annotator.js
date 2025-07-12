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
const rateLimit_1 = require("../middleware/rateLimit");
const rbac_2 = require("@tetrix/rbac");
const router = (0, express_1.Router)();
// Apply rate limiting and authentication to all data annotator routes
router.use(rateLimit_1.baseRateLimiter);
router.use(rateLimit_1.userRateLimiter);
router.use(auth_1.firebaseAuthMiddleware);
router.use((0, rbac_1.requireUserGroup)('data-annotator'));
// GET /api/data-annotator/projects - List projects
router.get('/projects', (0, rbac_1.requirePermission)(rbac_2.DataAnnotatorPermissions.ProjectCreate), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Mock data - replace with actual database query
        const projects = [
            { id: '1', name: 'Image Classification', status: 'active' },
            { id: '2', name: 'Text Annotation', status: 'active' },
        ];
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
}));
// POST /api/data-annotator/projects - Create new project
router.post('/projects', (0, rbac_1.requirePermission)(rbac_2.DataAnnotatorPermissions.ProjectCreate), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, type } = req.body;
        // Mock project creation
        const project = { id: Date.now().toString(), name, description, type, status: 'active' };
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
}));
// POST /api/data-annotator/tasks/:id/submit - Submit task with rate limiting
router.post('/tasks/:id/submit', rateLimit_1.taskSubmissionRateLimiter, (0, rbac_1.requirePermission)(rbac_2.DataAnnotatorPermissions.TaskSubmit), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { annotations, comment } = req.body;
        // Mock task submission
        const submission = {
            taskId: id,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            annotations,
            comment,
            submittedAt: new Date().toISOString(),
        };
        res.status(201).json(submission);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit task' });
    }
}));
// POST /api/data-annotator/upload - Upload dataset with rate limiting
router.post('/upload', rateLimit_1.uploadRateLimiter, (0, rbac_1.requirePermission)(rbac_2.DataAnnotatorPermissions.DatasetUpload), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Mock file upload
        const upload = {
            id: Date.now().toString(),
            filename: req.body.filename,
            size: req.body.size,
            uploadedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            uploadedAt: new Date().toISOString(),
        };
        res.status(201).json(upload);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upload file' });
    }
}));
// GET /api/data-annotator/analytics - View analytics (admin only)
router.get('/analytics', (0, rbac_1.requireRole)(rbac_2.Roles.TaskAdmin), (0, rbac_1.requirePermission)(rbac_2.DataAnnotatorPermissions.AnalyticsView), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Mock analytics data
        const analytics = {
            totalTasks: 150,
            completedTasks: 120,
            accuracy: 0.95,
            averageTime: '2.5 hours',
        };
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
}));
// POST /api/data-annotator/tasks/:id/review - Review task (reviewer only)
router.post('/tasks/:id/review', (0, rbac_1.requireRole)(rbac_2.Roles.Reviewer), (0, rbac_1.requirePermission)(rbac_2.DataAnnotatorPermissions.TaskReview), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { approved, feedback } = req.body;
        // Mock review submission
        const review = {
            taskId: id,
            reviewerId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            approved,
            feedback,
            reviewedAt: new Date().toISOString(),
        };
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to review task' });
    }
}));
// GET /api/data-annotator/billing - View billing (billing admin only)
router.get('/billing', (0, rbac_1.requireRole)(rbac_2.Roles.BillingAdmin), (0, rbac_1.requirePermission)(rbac_2.DataAnnotatorPermissions.BillingView), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Mock billing data
        const billing = {
            currentMonth: 1250.00,
            previousMonth: 1100.00,
            outstanding: 250.00,
            currency: 'USD',
        };
        res.json(billing);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch billing' });
    }
}));
exports.default = router;
