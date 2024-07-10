"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = mongoose_1.default.Schema;
const blacklistedTokenSchema = new schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiryAt: {
        type: Number,
        required: true
    },
});
const BlacklistedToken = mongoose_1.default.model("BlacklistedToken", blacklistedTokenSchema);
exports.default = BlacklistedToken;
