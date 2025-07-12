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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../index")); // Adjust if your Express app entry point is elsewhere
const testUtils_1 = require("./testUtils");
let studentToken;
let reviewerToken;
const assignmentId = 'test-assignment-1';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    studentToken = yield (0, testUtils_1.getTestToken)('student-uid', { roles: ['CodingStudent'] });
    reviewerToken = yield (0, testUtils_1.getTestToken)('reviewer-uid', { roles: ['AcademyReviewer'] });
}));
describe('Academy Endpoints', () => {
    // Helper to set auth header
    const auth = (t) => ({ Authorization: `Bearer ${t}` });
    it('rejects invalid assignment submission payload', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/academy/assignments')
            .set(auth(studentToken))
            .send({}); // Missing required fields
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body).toHaveProperty('details');
    }));
    it('submits a valid assignment', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/academy/assignments')
            .set(auth(studentToken))
            .send({
            fileUrl: 'https://example.com/file.zip',
            comment: 'My work',
            assignmentId,
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('ok', true);
        expect(res.body).toHaveProperty('assignmentId', assignmentId);
    }));
    it('lists assignments for the student', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/academy/assignments')
            .set(auth(studentToken));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((a) => a.id === assignmentId)).toBe(true);
    }));
    it('lists assignments needing review (reviewer only)', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/academy/review-queue')
            .set(auth(reviewerToken));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((a) => a.id === assignmentId)).toBe(true);
    }));
    it('rejects invalid review payload', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .patch(`/api/academy/review/${assignmentId}`)
            .set(auth(reviewerToken))
            .send({}); // Missing required fields
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body).toHaveProperty('details');
    }));
    it('reviews an assignment', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .patch(`/api/academy/review/${assignmentId}`)
            .set(auth(reviewerToken))
            .send({
            status: 'approved',
            reviewComment: 'Looks good!',
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('ok', true);
        expect(res.body).toHaveProperty('id', assignmentId);
        expect(res.body).toHaveProperty('status', 'approved');
    }));
    it('lists CI results for the user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/academy/ci')
            .set(auth(studentToken));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }));
    it('Jest is running', () => {
        expect(true).toBe(true);
    });
});
