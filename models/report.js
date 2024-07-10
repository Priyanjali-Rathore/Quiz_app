"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = mongoose_1.default.Schema;
const reportSchema = new schema({
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        required: true,
    },
    quizId: {
        type: mongoose_1.default.Types.ObjectId,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
    result: {
        type: String,
        required: true
    },
}, { timestamps: true });
const Report = mongoose_1.default.model("Report", reportSchema);
//model
exports.default = Report;
