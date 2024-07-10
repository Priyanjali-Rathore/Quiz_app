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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const exam_1 = __importDefault(require("./routes/exam"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const report_1 = __importDefault(require("./routes/report"));
const user_1 = __importDefault(require("./routes/user"));
const favQuestion_1 = __importDefault(require("./routes/favQuestion"));
const clearBlacklistedTokenScheduler_1 = __importDefault(require("./utils/clearBlacklistedTokenScheduler"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: `http://${process.env.CORS_ORIGIN_URL}`, credentials: true }));
const connectionString = "mongodb+srv://priyanjalik39:2JSpoHWFCnXpKgmt@mycluster.kmcb0fv.mongodb.net/?retryWrites=true&w=majority&appName=mycluster";
const port = process.env.PORT;
app.use(express_1.default.json());
//Redirect /auth
app.use("/auth", auth_1.default);
//Redirect /exam
app.use("/exam", exam_1.default);
//Redirect /quiz
app.use("/quiz", quiz_1.default);
//Redirect /report
app.use("/report", report_1.default);
//Redirect /user to userRoute
app.use("/user", user_1.default);
//Redirect /favQuestion to favQuestionRoute
app.use("/favquestion", favQuestion_1.default);
app.get("/health", (req, res) => {
    res.status(200).send("Server is working!");
});
app.use((err, req, res, next) => {
    // email to corresponding email
    // logger for err
    let message;
    let statusCode;
    if (!!err.statusCode && err.statusCode < 500) {
        message = err.message;
        statusCode = err.statusCode;
    }
    else {
        message = "Something went wrong please try after sometime!";
        statusCode = 500;
    }
    let resp = { status: "error", message, data: {} };
    if (!!err.data) {
        resp.data = err.data;
    }
    console.log(err.statusCode, err.message);
    res.status(statusCode).send(resp);
});
clearBlacklistedTokenScheduler_1.default;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(connectionString);
        app.listen(5000, () => {
            console.log("Server Connected");
        });
    }
    catch (error) {
        console.log(error);
    }
}))();
// import express from 'express';
// import mongoose from 'mongoose';
// import jwt from 'express-jwt';
// import UserRoute from './routes/user';
// import { addUserIdToRequest } from './middlewares/isAuth';
// //UserRoutes
// const app=express();
// app.use(jwt({
//     secret: 'your-secret-key',
//     getToken: req => req.headers['authorization'],
//     credentialsRequired: false,
//   }));
// const connectionString="mongodb+srv://priyanjalik39:2JSpoHWFCnXpKgmt@mycluster.kmcb0fv.mongodb.net/?retryWrites=true&w=majority&appName=mycluster";
// app.use(express.json());
// app.get('/',(req,res)=>{
//     res.send("Hello");
// })
// //redirect /user to UserRoutes
// app.use('/user', UserRoute);
// mongoose.connect(connectionString)
//     .then(() => {
//         console.log("Database connected successfully");
//         app.listen(5000, () => {
//             console.log("Server is running on port 5000");
//         });
//     })
//     .catch((err) => {
//         console.log(err);
//     });
// // mongoose.connect(connectionString, (err:any) => {
// //     if(err){
// //         console.log(err);
// //         return;
// //     }
// //     app.listen(5000,()=>{
// //         console.log("Server is running on port 5000");
// //     });
// // })
