"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const exam_1 = require("../controllers/exam");
const validateRequest_1 = require("../helper/validateRequest");
const isAuth_1 = require("../middlewares/isAuth");
const router = express_1.default.Router();
// GET /exam/quizId
router.get("/:quizId", isAuth_1.isAuthenticated, exam_1.startExam);
// POST /exam
router.post("/", isAuth_1.isAuthenticated, [
    (0, express_validator_1.body)("quizId")
        .trim()
        .not()
        .isEmpty()
        .custom((quizId) => {
        return (0, exam_1.doesQuizExist)(quizId)
            .then((status) => {
            if (!status) {
                return Promise.reject("Please provide a valid quiz id.");
            }
        })
            .catch((err) => {
            return Promise.reject(err);
        });
    }),
    (0, express_validator_1.body)("attemptedQuestion")
        .not()
        .isEmpty()
        .custom((attemptedQuestion, { req }) => {
        return (0, exam_1.isValidAttempt)(attemptedQuestion, req.body.quizId)
            .then((status) => {
            if (!status) {
                return Promise.reject();
            }
        })
            .catch((err) => {
            return Promise.reject(err);
        });
    })
        .withMessage("Invalid attempt!"),
], validateRequest_1.validateRequest, exam_1.submitExam);
exports.default = router;
