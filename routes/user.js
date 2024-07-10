"use strict";
//Redirect request to particular method on controller
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_1 = require("../controllers/user");
const blacklistedToken_1 = require("../controllers/blacklistedToken");
const isAuth_1 = require("../middlewares/isAuth");
const auth_1 = require("../controllers/auth");
const validateRequest_1 = require("../helper/validateRequest");
const router = express_1.default.Router();
// User should be authenticate
// User should be authorize
//Get /user/:userId
router.get("/", isAuth_1.isAuthenticated, user_1.getUser);
// User should be authenticate
// User should be authorize
//Put /user/
router.put("/", isAuth_1.isAuthenticated, user_1.updateUser);
//PATCH /user/deactivate
router.patch("/deactivate", isAuth_1.isAuthenticated, user_1.deactivateUser);
// Verify Deactivate Account Email OTP
// POST -> /user/deactivate/verify-deactivate-account-otp
router.post("/deactivate/verify-deactivate-account-otp", isAuth_1.isAuthenticated, user_1.verifyDeactivateAccountOTP);
//Put  /user/changepassword
router.put("/changepassword", isAuth_1.isAuthenticated, [
    (0, express_validator_1.body)("newPassword")
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
], validateRequest_1.validateRequest, user_1.changePassword);
// POST /user/logout
router.post("/logout", isAuth_1.isAuthenticated, blacklistedToken_1.logOut);
exports.default = router;
// import express from 'express';
// import {registerUser,getUser,updateUser,loginUser} from '../controllers/user';
// const router = express.Router();
// //POST /user/
// router.post('/', registerUser);
// //POST /user/login
// router.post('/login', loginUser);
// //Get /user/:userId
// router.get('/:userId',getUser );
// //Put /user/
// router.put('/', updateUser);
// export default router;
