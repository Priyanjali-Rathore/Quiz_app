"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = mongoose_1.default.Schema;
//schema
const quizSchema = new schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        required: true
    },
    difficultyLevel: {
        type: String,
        required: true,
        enum: ["easy", "medium", "hard"],
    },
    questionList: [
        {
            questionNumber: Number,
            question: String,
            options: {},
        },
    ],
    answers: {},
    passingPercentage: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose_1.default.Types.ObjectId,
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    isPublicQuiz: {
        type: Boolean,
        required: true
    },
    allowedUser: {
        type: [],
        default: []
    },
    attemptsAllowedPerUser: {
        type: Number //required is false, if not provided quiz can be attempted multiple times
    },
    attemptedUsers: [
        {
            id: String,
            attemptsLeft: Number
        }
    ]
}, { timestamps: true });
const Quiz = mongoose_1.default.model("Quiz", quizSchema);
exports.default = Quiz;
