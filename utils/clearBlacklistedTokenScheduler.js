"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const blacklistedToken_1 = require("../controllers/blacklistedToken");
// Schedule a daily cleanup task
const clearBlacklistedTokenScheduler = node_cron_1.default.schedule('0 0 * * *', () => {
    (0, blacklistedToken_1.clearBlacklist)();
});
exports.default = clearBlacklistedTokenScheduler;
