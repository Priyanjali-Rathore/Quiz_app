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
exports.resendRegistrationOTP = void 0;
exports.sendDeactivateEmailOTP = sendDeactivateEmailOTP;
const email_1 = __importDefault(require("../utils/email"));
const OTP_1 = __importDefault(require("../models/OTP"));
const user_1 = __importDefault(require("../models/user"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const error_1 = __importDefault(require("../helper/error"));
// Define a function to send emails
function sendEmailOTPRegister(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let resp;
            // check if user already present
            // Find user with provided email
            const checkUserPresent = yield user_1.default.findOne({ email });
            // to be used in case of sign up
            // if user found then return a error response
            if (checkUserPresent && checkUserPresent.isVerified) {
                // Return 401 Unauthorized status code with error message
                const err = new error_1.default("user already Registered..");
                err.statusCode = 401;
                throw err;
            }
            // generate otp 
            var otp = otp_generator_1.default.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            const result = yield OTP_1.default.findOne({ otp: otp });
            // when result find then change the otp always unique otp store in database
            while (result) {
                otp = otp_generator_1.default.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false
                });
            }
            const mailResponse = yield (0, email_1.default)(email, "Verification Registration Email OTP ", `Registration OTP is ${otp}`);
            const saveOTP = new OTP_1.default({ email, otp });
            const saveResult = yield saveOTP.save();
            if (!saveResult) {
                const err = new error_1.default("OTP has not save in DataBase");
                err.statusCode = 401;
                throw err;
            }
            else {
                return true;
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.default = sendEmailOTPRegister;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const resendRegistrationOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let resp;
        // const email = req.params.email;
        const secretKey = process.env.SECRET_KEY || "";
        let decodedToken;
        decodedToken = jsonwebtoken_1.default.verify(req.params.token, secretKey);
        const email = decodedToken.email.toString();
        const checkUserExits = yield user_1.default.findOne({ email });
        if (!checkUserExits) {
            const err = new error_1.default("User not exist..");
            err.statusCode = 401;
            throw err;
        }
        if (checkUserExits && checkUserExits.isVerified) {
            const err = new error_1.default("Already Verified your Account");
            err.statusCode = 401;
            throw err;
        }
        const otpExist = yield OTP_1.default.findOne({ email });
        if (otpExist) {
            const otpExistCreatedAt = new Date(otpExist.createdAt); // Assuming otpExist.createdAt is a Date object
            const currentTime = new Date();
            const timeDifferenceInMilliseconds = (otpExistCreatedAt.getTime() + 120000) - currentTime.getTime();
            const timeDifferenceInMinutes = Math.floor(timeDifferenceInMilliseconds / (1000 * 60));
            const timeExpire = timeDifferenceInMinutes;
            const err = new error_1.default(`Resend OTP after ${timeExpire + 1} minutes`);
            err.statusCode = 401;
            throw err;
        }
        const sendOTP = yield sendEmailOTPRegister(email);
        if (!sendOTP) {
            const err = new error_1.default("Resend otp Error");
            err.statusCode = 401;
            throw err;
        }
        resp = { status: "success", message: "OTP send successfully. Please Verify Account", data: {} };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.resendRegistrationOTP = resendRegistrationOTP;
function sendDeactivateEmailOTP(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let resp;
            // check if user already present
            // Find user with provided email
            const checkUserPresent = yield user_1.default.findOne({ email });
            // to be used in case of sign up
            // if user found then return a error response
            if (checkUserPresent && checkUserPresent.isDeactivated) {
                // Return 401 Unauthorized status code with error message
                const err = new error_1.default("user already Deactivate..");
                err.statusCode = 401;
                throw err;
            }
            // generate otp 
            var otp = otp_generator_1.default.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            const result = yield OTP_1.default.findOne({ otp: otp });
            // when result find then change the otp always unique otp store in database
            while (result) {
                otp = otp_generator_1.default.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false
                });
            }
            const mailResponse = yield (0, email_1.default)(email, "Verification Deactivate Account Email OTP", `Deactivate Account OTP is ${otp}`);
            console.log("Email send successfully: ", mailResponse);
            const saveOTP = new OTP_1.default({ email, otp });
            const saveResult = yield saveOTP.save();
            if (!saveResult) {
                const err = new error_1.default("OTP has not save in DataBase");
                err.statusCode = 401;
                throw err;
            }
            else {
                console.log("Successfully Save otp please verify..");
                return true;
            }
        }
        catch (error) {
            console.log("Error occured while sending email: ", error);
            throw error;
        }
    });
}
