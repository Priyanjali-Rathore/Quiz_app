"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favQuestion_1 = require("../controllers/favQuestion");
const isAuth_1 = require("../middlewares/isAuth");
const router = express_1.default.Router();
//Post /favquestion
router.post("/", isAuth_1.isAuthenticated, favQuestion_1.addFavQuestion);
//Get /favquestion
router.get("/", isAuth_1.isAuthenticated, favQuestion_1.showFavQuestion);
//Post /favquestion:favquestionId
router.delete("/:favquestionId", isAuth_1.isAuthenticated, favQuestion_1.removeFavQuestion);
exports.default = router;
