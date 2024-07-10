"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const error_1 = __importDefault(require("./error"));
const validateRequest = (req, res, next) => {
    //validation
    try {
        const validationError = (0, express_validator_1.validationResult)(req);
        if (!validationError.isEmpty()) {
            const err = new error_1.default("Validation failed!");
            err.statusCode = 422;
            err.data = validationError.array();
            throw err;
        }
        //validation end
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateRequest = validateRequest;
