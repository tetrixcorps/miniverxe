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
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    message: zod_1.z.string().min(1),
});
// POST /api/contact
router.post('/', (0, validation_1.validateBody)(contactSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Store contact form submission (DB, email, etc.)
        res.status(201).json({ message: 'Contact form submitted' });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
