"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const otp_1 = require("../controllers/otp");
const auth_1 = require("../controllers/auth");
const validateRequest_1 = require("../helper/validateRequest");
const router = express_1.default.Router();
// POST /auth/
router.post("/", [
    (0, express_validator_1.body)("name")
        .trim()
        .not()
        .isEmpty()
        .isLength({ min: 4 })
        .withMessage("Please enter a valid name, minimum 4 character long"),
    (0, express_validator_1.body)("email")
        .trim()
        .isEmail()
        .custom((emailId) => {
        return (0, auth_1.isUserExist)(emailId)
            .then((status) => {
            if (status) {
                return Promise.reject("User already exist!");
            }
        })
            .catch((err) => {
            return Promise.reject(err);
        });
    }),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 8 })
        .custom((password) => {
        return (0, auth_1.isPasswordValid)(password)
            .then((status) => {
            if (!status)
                return Promise.reject("Enter a valid password, having atleast 8 characters including 1 small alphabet, 1 capital albhabet, 1 digit and 1 special character($,@,!,#,*).");
        })
            .catch((err) => {
            return Promise.reject(err);
        });
    }),
    (0, express_validator_1.body)("confirmPassword")
        .trim()
        .custom((value, { req }) => {
        if (value != req.body.password) {
            return Promise.reject("Password mismatched!");
        }
        return true;
    }),
], validateRequest_1.validateRequest, auth_1.registerUser);
// POST /auth/login
router.post("/login", [
    (0, express_validator_1.body)("email").trim().isEmail().withMessage("Invalid Credentials!"),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 8 })
        .custom((password) => {
        return (0, auth_1.isPasswordValid)(password)
            .then((status) => {
            if (!status)
                return Promise.reject();
        })
            .catch((err) => {
            return Promise.reject(err);
        });
    })
        .withMessage("Invalid Credentials!"),
], validateRequest_1.validateRequest, auth_1.loginUser);
//POST /auth/activate account
router.post('/activateaccount', [
    (0, express_validator_1.body)('key')
        .trim()
        .isLength({ min: 8 }).withMessage("Invalid Key!"),
    (0, express_validator_1.body)("email").trim().isEmail().withMessage("Invalid Email!")
], auth_1.activateAccount);
//Verify Registration otp route
// POST -> /auth/verify-registration-otp/:token  (use params)
router.post("/verify-registration-otp/:token", auth_1.verifyRegistrationOTP);
// Resend otp for registration
// POST -> /auth/resend-registration-otp/:token  (use Params)
router.get("/resend-registration-otp/:token", otp_1.resendRegistrationOTP);
router.post("/activate", [(0, express_validator_1.body)("email").trim().isEmail().withMessage("Invalid Email!")], auth_1.activateUser);
//re-activate link
// GET /user/activate
router.get("/activate/:token", auth_1.activateUserCallback);
//POST 
router.post("/forgotpassword", [(0, express_validator_1.body)("email").trim().isEmail().withMessage("Invalid Email!")], auth_1.forgotPassword);
router.get("/forgotpassword/:token", auth_1.forgotPasswordCallback);
router.post("/forgotpassword/:userId", [
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 8 })
        .custom((password) => {
        return (0, auth_1.isPasswordValid)(password)
            .then((status) => {
            if (!status)
                return Promise.reject("Enter a valid password, having atleast 8 characters including 1 small alphabet, 1 capital albhabet, 1 digit and 1 special character($,@,!,#,*).");
        })
            .catch((err) => {
            return Promise.reject(err);
        });
    }),
    (0, express_validator_1.body)("confirmPassword")
        .trim()
        .custom((value, { req }) => {
        if (value != req.body.password) {
            return Promise.reject("Password mismatched!");
        }
        return true;
    }),
], auth_1.resetPassword);
exports.default = router;
