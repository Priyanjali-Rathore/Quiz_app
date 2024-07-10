"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = mongoose_1.default.Schema;
//schema
const userSchema = new schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isDeactivated: {
        type: Boolean,
        default: false,
    },
    remainingTry: {
        type: Number,
        default: 3,
    },
    temperoryKey: {
        type: String,
        default: ''
    },
    freezeTime: {
        type: Date,
        default: new Date()
    },
    accountBlocked: {
        type: Boolean,
        default: false
    },
    isTempKeyUsed: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema);
//model
exports.default = User;
