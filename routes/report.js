"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_1 = require("../controllers/report");
const isAuth_1 = require("../middlewares/isAuth");
const router = express_1.default.Router();
//GET /report/:reportId
router.get("/:reportId?", isAuth_1.isAuthenticated, report_1.getReport);
exports.default = router;
