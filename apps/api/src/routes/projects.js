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
const rbac_1 = require("../middleware/rbac");
// import prisma from '../prisma'; // Uncomment and adjust import as needed
const router = (0, express_1.Router)();
// Example protected endpoint: GET /api/projects
router.get('/', (0, rbac_1.requirePermission)('project:read'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const projects = await prisma.project.findMany({ where: { organizationId: req.user.organizationId } });
        // res.json(projects);
        res.json([
            { id: 'proj1', name: 'Demo Project', status: 'active' },
            { id: 'proj2', name: 'Test Project', status: 'archived' },
        ]); // Placeholder
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
