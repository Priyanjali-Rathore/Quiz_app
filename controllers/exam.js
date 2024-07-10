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
exports.submitExam = exports.startExam = exports.isValidAttempt = exports.doesQuizExist = void 0;
const error_1 = __importDefault(require("../helper/error"));
const quiz_1 = __importDefault(require("../models/quiz"));
const report_1 = __importDefault(require("../models/report"));
const startExam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const quizId = req.params.quizId;
        const quiz = yield quiz_1.default.findById(quizId, {
            name: 1,
            questionList: 1,
            isPublished: 1,
            createdBy: 1,
            category: 1,
            attemptsAllowedPerUser: 1,
            attemptedUsers: 1,
            passingPercentage: 1,
            isPublicQuiz: 1,
            allowedUser: 1
        });
        if (!quiz) {
            const err = new error_1.default("No quiz found!");
            err.statusCode = 404;
            throw err;
        }
        if (!quiz.isPublished) {
            const err = new error_1.default("Quiz is not published!");
            err.statusCode = 405;
            throw err;
        }
        if (quiz.createdBy.toString() === userId) {
            const err = new error_1.default("You can't attend your own quiz!");
            err.statusCode = 405;
        }
        if (!quiz.isPublicQuiz && !quiz.allowedUser.includes(req.userId)) {
            const err = new error_1.default("You are not authorized!");
            err.statusCode = 403;
            throw err;
        }
        if (quiz.category === "test") {
            if (quiz.attemptsAllowedPerUser) {
                if (quiz.attemptedUsers.length) {
                    quiz.attemptedUsers.forEach((user) => {
                        const id = user.id;
                        if (id === req.userId) {
                            if (user.attemptsLeft !== undefined && user.attemptsLeft !== null) {
                                if (user.attemptsLeft > 0) {
                                    user.attemptsLeft -= 1;
                                }
                                else {
                                    const err = new error_1.default("You have zero attempts left!");
                                    err.statusCode = 405;
                                    throw err;
                                }
                            }
                        }
                    });
                    const updated = yield quiz.save();
                }
                else {
                    if (req.userId && quiz.attemptsAllowedPerUser) {
                        const newUser = { id: req.userId.toString(), attemptsLeft: quiz.attemptsAllowedPerUser - 1 };
                        quiz.attemptedUsers.push(newUser);
                        const updated = yield quiz.save();
                    }
                }
            }
        }
        const resp = {
            status: "success",
            message: "Quiz",
            data: quiz,
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.startExam = startExam;
const submitExam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const quizId = req.body.quizId;
        const attemptedQuestion = req.body.attemptedQuestion;
        const quiz = yield quiz_1.default.findById(quizId, { questionList: 1, answers: 1, passingPercentage: 1 });
        if (!quiz) {
            const err = new error_1.default("No quiz found!");
            err.statusCode = 404;
            throw err;
        }
        if (quiz.createdBy.toString() === userId) {
            const err = new error_1.default("You can't submit your own quiz!");
            err.statusCode = 405;
            throw err;
        }
        const answers = quiz.answers;
        const passingPercentage = quiz.passingPercentage;
        const allQuestions = Object.keys(answers);
        const total = allQuestions.length;
        let score = 0;
        let attemptedAnswerWithRightAnswer = [];
        for (let i = 0; i < total; i++) {
            let questionNumber = allQuestions[i];
            const attemptedAnswer = attemptedQuestion[questionNumber];
            const rightAnswer = answers[questionNumber];
            if (!!attemptedAnswer) {
                attemptedAnswerWithRightAnswer.push({
                    questionNumber,
                    attemptedAnswer,
                    rightAnswer
                });
            }
            if (!!attemptedQuestion[questionNumber] &&
                answers[questionNumber] == attemptedQuestion[questionNumber]) {
                score = score + 1;
            }
        }
        let result = "";
        let percentage = 0;
        percentage = (score / total) * 100;
        if (percentage >= passingPercentage) {
            result += "Pass";
        }
        else {
            result += "Fail";
        }
        const report = new report_1.default({
            userId,
            quizId,
            score,
            total,
            percentage,
            result,
            attemtedAnswers: attemptedAnswerWithRightAnswer
        });
        const data = yield report.save();
        const resp = {
            status: "success",
            message: "Quiz submitted",
            data: { total, score, result, reportId: data._id, attemptedAnswerWithRightAnswer }
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.submitExam = submitExam;
const doesQuizExist = (quizId) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = yield quiz_1.default.findById(quizId);
    if (!quiz)
        return false;
    return true;
});
exports.doesQuizExist = doesQuizExist;
const isValidAttempt = (attemptedQuestion, quizId) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = yield quiz_1.default.findById(quizId);
    if (!quiz) {
        const err = new error_1.default("No quiz found!");
        err.statusCode = 404;
        throw err;
    }
    const answers = quiz.answers;
    const questions = Object.keys(answers);
    const attemptQ = Object.keys(attemptedQuestion);
    if (attemptQ.length != questions.length)
        return false;
    let flag = 0;
    attemptQ.forEach((e) => {
        if (questions.indexOf(e) < 0) {
            flag = 1;
        }
    });
    if (flag) {
        return false;
    }
    return true;
});
exports.isValidAttempt = isValidAttempt;
