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
exports.getAllQuizTest = exports.getAllQuizExam = exports.getAllQuiz = exports.updateQuiz = exports.publishQuiz = exports.isValidQuizName = exports.isValidQuiz = exports.getQuiz = exports.deleteQuiz = exports.createQuiz = void 0;
const error_1 = __importDefault(require("../helper/error"));
const quiz_1 = __importDefault(require("../models/quiz"));
const createQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const createdBy = req.userId;
        const name = req.body.name;
        const category = req.body.category;
        const difficultyLevel = req.body.difficultyLevel;
        const questionList = req.body.questionList;
        const answers = req.body.answers;
        const passingPercentage = req.body.passingPercentage;
        const attemptsAllowedPerUser = req.body.attemptsAllowedPerUser;
        const isPublicQuiz = req.body.isPublicQuiz;
        const allowedUser = req.body.allowedUser;
        const quiz = new quiz_1.default({ name, category, difficultyLevel, questionList, answers, passingPercentage, createdBy, attemptsAllowedPerUser, isPublicQuiz, allowedUser });
        const result = yield quiz.save();
        const resp = {
            status: "success",
            message: "Quiz created successfully",
            data: { quizId: result._id },
        };
        res.status(201).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.createQuiz = createQuiz;
const getQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quizId = req.params.quizId;
        let quiz;
        if (quizId) {
            quiz = yield quiz_1.default.findById(quizId, {
                name: 1,
                category: 1,
                questionList: 1,
                answers: 1,
                createdBy: 1,
                passingPercentage: 1,
                isPublicQuiz: 1,
                allowedUser: 1
            });
            if (!quiz) {
                const err = new error_1.default("No quiz found!");
                err.statusCode = 404;
                throw err;
            }
            if (!quiz.isPublicQuiz && !quiz.allowedUser.includes(req.userId)) {
                const err = new error_1.default("You are not authorized!");
                err.statusCode = 403;
                throw err;
            }
            if (req.userId !== quiz.createdBy.toString()) {
                const err = new error_1.default("You are not authorized!");
                err.statusCode = 403;
                throw err;
            }
        }
        else {
            quiz = yield quiz_1.default.find({ createdBy: req.userId });
        }
        if (!quiz) {
            const err = new error_1.default("Quiz not found!");
            err.statusCode = 404;
            throw err;
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
exports.getQuiz = getQuiz;
const updateQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quizId = req.body._id;
        const quiz = yield quiz_1.default.findById(quizId);
        if (!quiz) {
            const err = new error_1.default("Quiz not found!");
            err.statusCode = 404;
            throw err;
        }
        if (req.userId !== quiz.createdBy.toString()) {
            const err = new error_1.default("You are not authorized!");
            err.statusCode = 403;
            throw err;
        }
        if (quiz.isPublished) {
            const err = new error_1.default("You cannot update, published Quiz!");
            err.statusCode = 405;
            throw err;
        }
        if (quiz.name != req.body.name) {
            let status = yield isValidQuizName(req.body.name);
            if (!status) {
                const err = new error_1.default("Please enter an unique quiz name.");
                err.statusCode = 422;
                throw err;
            }
            quiz.name = req.body.name;
        }
        quiz.questionList = req.body.questionList;
        quiz.answers = req.body.answers;
        quiz.passingPercentage = req.body.passingPercentage;
        quiz.isPublicQuiz = req.body.isPublicQuiz;
        quiz.allowedUser = req.body.allowedUser;
        yield quiz.save();
        const resp = {
            status: "success",
            message: "Quiz updated successfully",
            data: {},
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.updateQuiz = updateQuiz;
const deleteQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quizId = req.params.quizId;
        const quiz = yield quiz_1.default.findById(quizId);
        if (!quiz) {
            const err = new error_1.default("Quiz not found!");
            err.statusCode = 404;
            throw err;
        }
        if (req.userId !== quiz.createdBy.toString()) {
            const err = new error_1.default("You are not authorized!");
            err.statusCode = 403;
            throw err;
        }
        if (quiz.isPublished) {
            const err = new error_1.default("You cannot delete, published Quiz!");
            err.statusCode = 405;
            throw err;
        }
        yield quiz_1.default.deleteOne({ _id: quizId });
        const resp = {
            status: "success",
            message: "Quiz deleted successfully",
            data: {},
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteQuiz = deleteQuiz;
const publishQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quizId = req.body.quizId;
        const quiz = yield quiz_1.default.findById(quizId);
        if (!quiz) {
            const err = new error_1.default("Quiz not found!");
            err.statusCode = 404;
            throw err;
        }
        if (req.userId !== quiz.createdBy.toString()) {
            const err = new error_1.default("You are not authorized!");
            err.statusCode = 403;
            throw err;
        }
        if (!!quiz.isPublished) {
            const err = new error_1.default("Quiz is already published!");
            err.statusCode = 405;
            throw err;
        }
        if (quiz.isPublicQuiz === false && quiz.allowedUser.length === 0) {
            const err = new error_1.default("Specify users for private quiz!");
            err.statusCode = 404;
            throw err;
        }
        quiz.isPublished = true;
        yield quiz.save();
        const resp = {
            status: "success",
            message: "Quiz published!",
            data: {},
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.publishQuiz = publishQuiz;
const isValidQuiz = (questionList, answers) => __awaiter(void 0, void 0, void 0, function* () {
    if (!questionList.length) {
        return false;
    }
    if (questionList.length != Object.keys(answers).length) {
        return false;
    }
    let flag = true;
    questionList.forEach((question) => {
        let opt = Object.keys(question["options"]);
        if (opt.indexOf(`${Object.values(answers)[Object.keys(answers).indexOf(question.questionNumber.toString())]}`) == -1) {
            flag = false;
        }
    });
    return flag;
});
exports.isValidQuiz = isValidQuiz;
const isValidQuizName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = yield quiz_1.default.findOne({ name });
    if (!quiz) {
        return true;
    }
    return false;
});
exports.isValidQuizName = isValidQuizName;
const getAllQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let quiz = yield quiz_1.default.find({ isPublished: true }, {
            name: 1,
            category: 1,
            questionList: 1,
            createdBy: 1,
            passingPercentage: 1,
            isPublicQuiz: 1,
            allowedUser: 1
        });
        //filter quizzes created by user itself
        quiz = quiz.filter(item => {
            if (item.isPublicQuiz || item.allowedUser.includes(req.userId)) {
                return item.createdBy.toString() !== req.userId;
            }
        });
        if (!quiz) {
            const err = new error_1.default("No quiz found!");
            err.statusCode = 404;
            throw err;
        }
        const resp = {
            status: "success",
            message: "All Published Quiz",
            data: quiz,
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllQuiz = getAllQuiz;
const getAllQuizExam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let quiz = yield quiz_1.default.find({ isPublished: true, category: "exam" }, {
            name: 1,
            category: 1,
            questionList: 1,
            createdBy: 1,
            passingPercentage: 1,
            isPublicQuiz: 1,
            allowedUser: 1,
        });
        quiz = quiz.filter((item) => {
            if (item.isPublicQuiz || item.allowedUser.includes(req.userId)) {
                return item.createdBy.toString() !== req.userId;
            }
        });
        if (!quiz) {
            const err = new error_1.default("No exam quiz found!");
            err.statusCode = 404;
            throw err;
        }
        const resp = {
            status: "success",
            message: "All Exam Quizzes",
            data: quiz,
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllQuizExam = getAllQuizExam;
const getAllQuizTest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let quiz = yield quiz_1.default.find({ isPublished: true, category: "test" }, {
            name: 1,
            category: 1,
            questionList: 1,
            createdBy: 1,
            passingPercentage: 1,
            isPublicQuiz: 1,
            allowedUser: 1,
        });
        quiz = quiz.filter((item) => {
            if (item.isPublicQuiz || item.allowedUser.includes(req.userId)) {
                return item.createdBy.toString() !== req.userId;
            }
        });
        if (!quiz) {
            const err = new error_1.default("No test quiz found!");
            err.statusCode = 404;
            throw err;
        }
        const resp = {
            status: "success",
            message: "All Test Quizzes",
            data: quiz,
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllQuizTest = getAllQuizTest;
