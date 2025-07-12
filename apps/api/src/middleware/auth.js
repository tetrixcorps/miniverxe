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
exports.authMiddleware = authMiddleware;
exports.firebaseAuthMiddleware = firebaseAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Replace with your actual secret or public key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
}
function firebaseAuthMiddleware(req, res, next) {
    // Call the async logic but do not return a Promise to Express
    (() => __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            res.status(401).json({ error: 'Missing or invalid Authorization header' });
            return;
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const decoded = yield firebase_admin_1.default.auth().verifyIdToken(token);
            req.user = {
                id: decoded.uid,
                email: decoded.email || '',
                roles: decoded.roles || [],
                permissions: decoded.permissions || [],
                userGroup: decoded.userGroup || 'data-annotator',
                metadata: decoded.metadata || {},
            };
            next();
        }
        catch (err) {
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    }))();
}
