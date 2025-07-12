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
// import { requirePermission } from '../middleware/rbac'; // Not needed, just auth
const router = (0, express_1.Router)();
// GET /api/permissions
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        res.json({ permissions: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.permissions) || [] });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
