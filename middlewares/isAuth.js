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
exports.isAuthenticated = void 0;
exports.addUserIdToRequest = addUserIdToRequest;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../controllers/user");
const error_1 = __importDefault(require("../helper/error"));
const blacklistedToken_1 = require("../controllers/blacklistedToken");
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const secretKey = process.env.SECRET_KEY || "";
        const authHeader = req.get("Authorization");
        if (!authHeader) {
            const err = new error_1.default("Not authenticated");
            err.statusCode = 401;
            throw err;
        }
        const token = authHeader.split(" ")[1];
        yield (0, blacklistedToken_1.blacklistedTokenCheck)(token);
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
        }
        catch (error) {
            const err = new error_1.default("Not authenticated");
            err.statusCode = 401;
            throw err;
        }
        if (!decodedToken) {
            const err = new error_1.default("Not authenticated");
            err.statusCode = 401;
            throw err;
        }
        //isActiveUser in user controller else inactive user
        if (!(yield (0, user_1.isActiveUser)(decodedToken.userId))) {
            const err = new error_1.default("User is deactivated!");
            err.statusCode = 422;
            throw err;
        }
        req.userId = decodedToken.userId;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.isAuthenticated = isAuthenticated;
function addUserIdToRequest(req, res, next) {
    req.userId = req.body.userId;
    next();
}
