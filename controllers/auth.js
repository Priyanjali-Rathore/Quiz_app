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
exports.verifyRegistrationOTP = exports.resetPassword = exports.forgotPasswordCallback = exports.forgotPassword = exports.activateAccount = exports.registerUser = exports.loginUser = exports.isUserExist = exports.isPasswordValid = exports.activateUserCallback = exports.activateUser = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// import { Request, Response, NextFunction} from 'express';
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = __importDefault(require("../helper/error"));
const user_1 = __importDefault(require("../models/user"));
const email_1 = __importDefault(require("../utils/email"));
const mailgen_1 = __importDefault(require("mailgen"));
const OTP_1 = __importDefault(require("../models/OTP"));
const otp_1 = __importDefault(require("./otp"));
const secretKey = process.env.SECRET_KEY || "";
const SERVER_BASE_URL = process.env.BASE_URL;
//const registerUser:RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        // take email , name , password from body
        const email = req.body.email;
        const name = req.body.name;
        // using bcrypt hash the password
        let password = yield bcryptjs_1.default.hash(req.body.password, 12);
        //create a token using email
        const token = jsonwebtoken_1.default.sign({ email: email }, secretKey);
        // send email otp for registration
        const sendOtp = yield (0, otp_1.default)(email);
        // if email send successfull
        if (sendOtp) {
            // check user already present in User DataBase or not
            const checkUserExits = yield user_1.default.findOne({ email });
            // if User present in databse then only update the data 
            if (checkUserExits) {
                // update data
                checkUserExits.name = name;
                checkUserExits.password = password;
                yield checkUserExits.save();
                resp = {
                    status: "success",
                    message: "OTP has sent on your email. Please Verify..",
                    // data: { userId: checkUserExits._id, token:token },
                    data: { email, token: token },
                };
                res.status(201).send(resp);
            }
            else {
                // if user does not present in Databse then create a new entry 
                const user = new user_1.default({ email, name, password });
                const result = yield user.save();
                if (!result) {
                    resp = { status: "error", message: "No result found", data: {} };
                    res.status(404).send(resp);
                }
                else {
                    resp = {
                        status: "success",
                        message: "OTP has sent on your email. Please Verify",
                        data: { email, token: token },
                    };
                    res.status(201).send(resp);
                }
            }
        }
        else {
            const err = new error_1.default("OTP not send..");
            err.statusCode = 401;
            throw err;
        }
    }
    catch (error) {
        next(error);
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        const email = req.body.email;
        const password = req.body.password;
        //find user with email
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            const err = new error_1.default("No user exist");
            err.statusCode = 401;
            throw err;
        }
        // if user has not verified email otp.
        if (!user.isVerified) {
            const err = new error_1.default("Account is not Verified. Please verify your account");
            err.statusCode = 401;
            throw err;
        }
        //verify if user is deactivated ot not
        if (user.isDeactivated) {
            const err = new error_1.default("Account is deactivated!");
            err.statusCode = 401;
            throw err;
        }
        //verify password using bcrypt
        const status = yield bcryptjs_1.default.compare(password, user.password);
        //then decide
        if (user === null || user === void 0 ? void 0 : user.accountBlocked) { //if account is blocked due to multiple attempts it is checking the remaining time left to unblock the account
            const time = 86400 - (new Date().getTime() - (user === null || user === void 0 ? void 0 : user.freezeTime.getTime())) / 1000;
            const hoursLeft = Math.floor(time / (60 * 60));
            const minutesLeft = Math.floor((time / 60) - (hoursLeft * 60));
            if (hoursLeft <= 0 && minutesLeft <= 0) { //This function is used if the limit of time is over it will unblock the account
                user && (user.remainingTry = 3);
                user && (user.accountBlocked = false);
                user && (user.temperoryKey = '');
                yield (user === null || user === void 0 ? void 0 : user.save());
            }
            else { //This function is used if the limit of time is not over it will throw an error and show the remaining time left to unblock the account
                const err = new error_1.default(`Your account have been blocked due to multiple attempts! try back after ${hoursLeft} hours and ${minutesLeft} minutes`);
                err.statusCode = 401;
                throw err;
            }
        }
        if (status && !(user === null || user === void 0 ? void 0 : user.accountBlocked) && (user === null || user === void 0 ? void 0 : user.remainingTry) < 1) {
            const err = new error_1.default('Your account is deactivated');
            err.statusCode = 401;
            throw err;
        }
        if (status && !(user === null || user === void 0 ? void 0 : user.accountBlocked)) {
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey, {
                expiresIn: "10h",
            });
            user && (user.remainingTry = 3);
            user && (user.temperoryKey = '');
            user && (user.accountBlocked = false);
            user && (user.isTempKeyUsed = false);
            yield (user === null || user === void 0 ? void 0 : user.save());
            resp = { status: "success", message: "Logged in", data: { token } };
            res.status(200).send(resp);
        }
        else { //This function is used if the password is wrong it will decrease the remaining try by 1 and if the remaining try is 0 it will throw an error for the maximum invalid attempts
            const updated = yield user_1.default.findOneAndUpdate({ email: user.email }, { $inc: { remainingTry: -1 } }, { new: true });
            if (updated && (updated === null || updated === void 0 ? void 0 : updated.remainingTry) < 1) {
                if ((updated === null || updated === void 0 ? void 0 : updated.temperoryKey.length) && !(updated === null || updated === void 0 ? void 0 : updated.accountBlocked)) {
                    (user === null || user === void 0 ? void 0 : user.isTempKeyUsed) && (updated.accountBlocked = true);
                    (user === null || user === void 0 ? void 0 : user.isTempKeyUsed) && (updated.temperoryKey = '');
                    updated && (updated.freezeTime = new Date());
                    yield (updated === null || updated === void 0 ? void 0 : updated.save());
                    //This function is used if the account is blocked user will recieve an email with a temperory key to activate the account if it is used and still invalid tries take place it will blocks the account for 24 hours otherwise it will tell the user to check your registered email address
                    const err = new error_1.default(`${(user === null || user === void 0 ? void 0 : user.isTempKeyUsed) ? "Your account have been blocked due to multiple attempts for 24 hours" : "Your Account has been deactivated check your registered email for further instructions!"}`);
                    err.statusCode = 401;
                    throw err;
                }
                //The following formula is used to generate an 8 digit temperory key and generate the email to the user and calculate the freezee time and temperory key
                const temperoryKey = Math.random().toString(36).substring(2, 10);
                generateEmail((updated === null || updated === void 0 ? void 0 : updated.name) || '', temperoryKey, (updated === null || updated === void 0 ? void 0 : updated.email) || '');
                updated && (updated.freezeTime = new Date());
                updated && (updated.temperoryKey = temperoryKey);
                yield (updated === null || updated === void 0 ? void 0 : updated.save());
                const err = new error_1.default(`Your Account has been deactivated check your registered email for further instructions`);
                err.statusCode = 401;
                throw err;
            }
            //If the password is wrong it will throw an error with the remaining try
            const err = new error_1.default(`Credential mismatch Try Left ${updated && (updated === null || updated === void 0 ? void 0 : updated.remainingTry)}`);
            err.statusCode = 401;
            throw err;
        }
    }
    catch (error) {
        next(error);
    }
});
exports.loginUser = loginUser;
// The activateAccount function is used to activate the account of the user by using the temperory key sent to the user's email address
const activateAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        const user = yield user_1.default.findOne({ email: req.body.email });
        if (!user) {
            const err = new error_1.default("No user exist");
            err.statusCode = 401;
            throw err;
        }
        if (req.body.key == (user === null || user === void 0 ? void 0 : user.temperoryKey)) {
            user && (user.remainingTry = 1);
            user && (user.isTempKeyUsed = true);
            yield (user === null || user === void 0 ? void 0 : user.save());
            const resp = { status: "success", message: "Key Validated you have only attempt for login" };
            res.status(200).send(resp);
        }
        else if (!(user === null || user === void 0 ? void 0 : user.temperoryKey.length)) {
            const err = new error_1.default("User is already Activated");
            err.statusCode = 403;
            throw err;
        }
        else {
            const err = new error_1.default("Invalid Key");
            err.statusCode = 401;
            throw err;
        }
    }
    catch (err) {
        next(err);
    }
});
exports.activateAccount = activateAccount;
//The following function is used to generate the email to the user
const generateEmail = (name, temperoryKey, emailaddress) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = process.env.USER || "";
    const userPassword = process.env.PASS || "";
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: userEmail,
            pass: userPassword
        }
    });
    //Using MaylGenerator Library to generate the email
    let MailGenerator = new mailgen_1.default({
        theme: "default",
        product: {
            name: "Quiz Application",
            link: '/'
        }
    });
    let response = {
        body: {
            name: name,
            intro: "Your Account has been freezed due to some unusual activity on your account",
            table: {
                data: [
                    {
                        "Temporary Key": temperoryKey
                    }
                ]
            },
            action: {
                instructions: `This is your one time temporary key to activate your account. After activating your account you will get one more chance to login. If you failed to login this time your account will be blocked for 24 hours.
        `,
                button: {
                    text: 'Thank You',
                    link: `http://${SERVER_BASE_URL}/auth/activateaccount/${temperoryKey}`
                }
            },
            outro: "Discover your inner genius - Take the quiz now!"
        }
    };
    let mail = MailGenerator.generate(response);
    let message = {
        from: userEmail,
        to: emailaddress,
        subject: "Quiz Account Freezed",
        html: mail
    };
    transporter.sendMail(message).then(() => {
    }).catch(error => () => __awaiter(void 0, void 0, void 0, function* () {
        let user = yield user_1.default.findOne({ email: emailaddress }); //If there is some issue in generating email set the temperory key string in collection to empty
        user && (user.temperoryKey = '');
        yield (user === null || user === void 0 ? void 0 : user.save());
        console.log("Unable to Send the Email");
    }));
});
//re-activate user
const activateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        const email = req.body.email;
        //find user with email
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            const err = new error_1.default("No user exist");
            err.statusCode = 401;
            throw err;
        }
        //verify if user is deactivated or not
        if (!user.isDeactivated) {
            const err = new error_1.default("User is already activated!");
            err.statusCode = 422;
            throw err;
        }
        const emailToken = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey, {
            expiresIn: "5m",
        });
        const userEmail = process.env.USER || "";
        const userPassword = process.env.PASS || "";
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: userEmail,
                pass: userPassword
            }
        });
        let MailGenerator = new mailgen_1.default({
            theme: "default",
            product: {
                name: "Quiz Application",
                link: '/'
            }
        });
        let response = {
            body: {
                name: user.name,
                intro: "Your Account Activation request is Approved Successfully",
                action: {
                    instructions: `Click the button below to activate your user account.  <br><br>
          Note: If the button or link is not clickable kindly copy the link and paste it in the browser<br><br>
          http://${SERVER_BASE_URL}/auth/activate/${emailToken}<br><br>
          `,
                    button: {
                        color: '#22BC66', // Optional action button color
                        text: 'Activate Account',
                        link: `http://${SERVER_BASE_URL}/auth/activate/${emailToken}/`
                    },
                },
                outro: "Discover your inner genius - Take the quiz now!"
            }
        };
        let mail = MailGenerator.generate(response);
        let messages = {
            from: userEmail,
            to: user.email,
            subject: "Quiz Account Activated",
            html: mail
        };
        transporter.sendMail(messages).then(() => {
            console.log("Email Sent ");
        }).catch(error => {
            console.log("Unable to Send the Email");
        });
        resp = {
            status: "success",
            message: "An Email has been sent to your account please verify!",
            data: {},
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.activateUser = activateUser;
const activateUserCallback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        //verify token sent
        const secretKey = process.env.SECRET_KEY || "";
        let decodedToken;
        const token = req.params.token;
        decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
        if (!decodedToken) {
            const err = new error_1.default("Invalid link!");
            err.statusCode = 401;
            throw err;
        }
        const userId = decodedToken.userId;
        const user = yield user_1.default.findOne({ _id: userId });
        if (!user) {
            const err = new error_1.default("User not found!");
            err.statusCode = 404;
            throw err;
        }
        user.isDeactivated = false;
        yield user.save();
        resp = { status: "success", message: "Account activated!", data: {} };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.activateUserCallback = activateUserCallback;
//forgot password
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        const email = req.body.email;
        //find user with email
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            const err = new error_1.default("No user exist");
            err.statusCode = 401;
            throw err;
        }
        const emailToken = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey, {
            expiresIn: "5m",
        });
        const message = `
    Click on the below link to reset the password of your account:
    http://${process.env.BASE_URL}/auth/forgotpassword/${emailToken}
    
    (Note: If the link is not clickable kindly copy the link and paste it in the browser.)`;
        (0, email_1.default)(user.email, "Verify Email", message);
        resp = {
            status: "success",
            message: "An Email has been sent to your account please verify!",
            data: {},
        };
        res.status(200).send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const forgotPasswordCallback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        //verify token sent
        const secretKey = process.env.SECRET_KEY || "";
        let decodedToken;
        const token = req.params.token;
        decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
        if (!decodedToken) {
            const err = new error_1.default("Invalid link!");
            err.statusCode = 401;
            throw err;
        }
        const userId = decodedToken.userId;
        // const redirectLink = `http://${process.env.BASE_URL}/auth/forgotpassword/${userId}`;
        // res.redirect(redirectLink);
        console.log(`http://${process.env.BASE_URL}/auth/forgotpassword/${userId}`);
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPasswordCallback = forgotPasswordCallback;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    try {
        const userId = req.params.userId;
        const user = yield user_1.default.findOne({ _id: userId });
        if (!user) {
            const err = new error_1.default("User not found!");
            err.statusCode = 404;
            throw err;
        }
        let password = yield bcryptjs_1.default.hash(req.body.password, 12);
        const confirmPassword = req.body.confirmPassword;
        // checking if password and confirmpassword are the same
        const isPasswordMatching = yield bcryptjs_1.default.compare(confirmPassword, password);
        if (!isPasswordMatching) {
            const err = new error_1.default("New password does not match. Enter new password again ");
            err.statusCode = 401;
            throw err;
        }
        user.password = password;
        yield user.save();
        resp = { status: "success", message: "Password updated", data: {} };
        res.send(resp);
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
const isUserExist = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ email });
    if (!user) {
        return false;
    }
    else if (user && !user.isVerified) {
        return false;
    }
    return true;
});
exports.isUserExist = isUserExist;
const isPasswordValid = (password) => __awaiter(void 0, void 0, void 0, function* () {
    let flag = 0;
    if (password.indexOf("!") == -1 &&
        password.indexOf("@") == -1 &&
        password.indexOf("#") == -1 &&
        password.indexOf("$") == -1 &&
        password.indexOf("*") == -1) {
        return false;
    }
    for (let ind = 0; ind < password.length; ind++) {
        let ch = password.charAt(ind);
        if (ch >= "a" && ch <= "z") {
            flag = 1;
            break;
        }
        flag = 0;
    }
    if (!flag) {
        return false;
    }
    flag = 0;
    for (let ind = 0; ind < password.length; ind++) {
        let ch = password.charAt(ind);
        if (ch >= "A" && ch <= "Z") {
            flag = 1;
            break;
        }
        flag = 0;
    }
    if (!flag) {
        return false;
    }
    flag = 0;
    for (let ind = 0; ind < password.length; ind++) {
        let ch = password.charAt(ind);
        if (ch >= "0" && ch <= "9") {
            flag = 1;
            break;
        }
        flag = 0;
    }
    if (flag) {
        return true;
    }
    return false;
});
exports.isPasswordValid = isPasswordValid;
// Verify Registration Email OTP
const verifyRegistrationOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let resp;
        // const email = req.params.email;
        const secretKey = process.env.SECRET_KEY || "";
        // decode the params token
        let decodedToken;
        decodedToken = jsonwebtoken_1.default.verify(req.params.token, secretKey);
        // convert Object String to string
        const email = decodedToken.email.toString();
        // take otp from body
        const otp = req.body.otp;
        // console.log("Email from params : ", email);
        // console.log("Email from BODY OTP : ", otp);
        // Check User present or not
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            const err = new error_1.default("No user exist..");
            err.statusCode = 401;
            throw err;
        }
        // Check User already verified or not
        if (user && user.isVerified) {
            const err = new error_1.default("User already exist");
            err.statusCode = 401;
            throw err;
        }
        // find last send otp for this email 
        const matchOTP = yield OTP_1.default.find({ email }).sort({ createdAt: -1 }).limit(1);
        // if otp not present for this email
        if (matchOTP.length === 0) {
            // OTP not found for the email
            const err = new error_1.default("OTP has not send on this email or Invalid OTP");
            err.statusCode = 400;
            throw err;
        }
        // if otp not present
        else if (otp != matchOTP[0].otp) {
            // The otp is not valid
            const err = new error_1.default("Incorrect OTP");
            err.statusCode = 400;
            throw err;
        }
        // update data verified true 
        user.isVerified = true;
        const result = yield user.save();
        resp = { status: "success", message: "Registration Done !!", data: { userId: user._id, email } };
        res.status(200).send(resp);
    }
    catch (error) {
        console.log("Error in verify Registration OTP : ", error);
        next(error);
    }
});
exports.verifyRegistrationOTP = verifyRegistrationOTP;
