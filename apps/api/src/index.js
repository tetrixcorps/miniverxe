"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Starting backend server...");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./middleware/auth");
const projects_1 = __importDefault(require("./routes/projects"));
const users_1 = __importDefault(require("./routes/users"));
const auth_2 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const contact_1 = __importDefault(require("./routes/contact"));
const permissions_1 = __importDefault(require("./routes/permissions"));
const session_1 = __importDefault(require("./routes/session"));
const data_annotator_1 = __importDefault(require("./routes/data-annotator"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mount protected routes with auth middleware
app.use('/api/projects', auth_1.authMiddleware, projects_1.default);
app.use('/api/users', auth_1.authMiddleware, users_1.default);
app.use('/api/admin', auth_1.authMiddleware, admin_1.default);
app.use('/api/permissions', auth_1.authMiddleware, permissions_1.default);
app.use('/api/session', auth_1.authMiddleware, session_1.default);
// Mount data annotator routes
app.use('/api/data-annotator', data_annotator_1.default);
// Public routes (no auth required)
app.use('/api/auth', auth_2.default);
app.use('/api/contact', contact_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use(errorHandler_1.errorHandler);
const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, '0.0.0.0', () => console.log(`API server running on port ${PORT}`));
exports.default = app;
