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
exports.logOut = exports.blacklistedTokenCheck = exports.clearBlacklist = void 0;
const blacklistedToken_1 = __importDefault(require("../models/blacklistedToken"));
const error_1 = __importDefault(require("../helper/error"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Function to clear the blacklist
const clearBlacklist = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = Math.floor(Date.now() / 1000);
        const tokens = yield blacklistedToken_1.default.deleteMany({
            expiryAt: { $lt: currentDate },
        }).exec();
        if (tokens) {
            console.log('Blacklist Cleared!');
        }
        else {
            console.log("Something went wrong while clearing blacklist!");
        }
    }
    catch (error) {
        console.log(error);
    }
});
exports.clearBlacklist = clearBlacklist;
// Check if the token is in the Blacklist
const blacklistedTokenCheck = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const blacklistItem = yield blacklistedToken_1.default.findOne({ token });
    if (blacklistItem) {
        const err = new error_1.default("Not authenticated!");
        err.statusCode = 403;
        throw err;
    }
});
exports.blacklistedTokenCheck = blacklistedTokenCheck;
const logOut = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader) {
            const err = new error_1.default("Something went wrong!");
            err.statusCode = 424;
            throw err;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        const secretKey = process.env.SECRET_KEY || "";
        decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
        const expiryAt = decodedToken.exp;
        const blacklistedToken = new blacklistedToken_1.default({ token, expiryAt });
        const result = yield blacklistedToken.save();
        if (!result) {
            resp = { status: "error", message: "Something went wrong!", data: {} };
            res.status(424).send(resp);
        }
        else {
            resp = { status: "success", message: "Logged out succesfully!", data: {} };
            res.status(200).send(resp);
        }
    }
    catch (error) {
        next(error);
    }
});
exports.logOut = logOut;
