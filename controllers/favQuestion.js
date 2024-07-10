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
exports.removeFavQuestion = exports.showFavQuestion = exports.addFavQuestion = void 0;
const user_1 = __importDefault(require("../models/user"));
const favQuestion_1 = __importDefault(require("../models/favQuestion"));
const error_1 = __importDefault(require("../helper/error"));
const addFavQuestion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    const userId = req.userId;
    const options = req.body.options;
    const question = req.body.question;
    try {
        const user = yield user_1.default.findById(userId);
        if (!user) {
            const err = new error_1.default("User does not exist");
            err.statusCode = 401;
            throw err;
        }
        const favQues = new favQuestion_1.default({ question, options, userId });
        yield favQues.save();
        resp = { status: "success", message: "Question added to Favourites!", data: {} };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.addFavQuestion = addFavQuestion;
const showFavQuestion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    let resp;
    try {
        const favQues = yield favQuestion_1.default.find({ userId });
        resp = { status: "success", message: "Favourite Questions!", data: { favQues } };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.showFavQuestion = showFavQuestion;
//user will get favourites only when he is authenticated,and once he get the id from fav collection he can delete it.
const removeFavQuestion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const questionId = req.params.favquestionId;
    try {
        yield favQuestion_1.default.deleteOne({ _id: questionId });
        const resp = {
            status: "success",
            message: "Question removed from favourites successfully",
            data: {},
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.removeFavQuestion = removeFavQuestion;
