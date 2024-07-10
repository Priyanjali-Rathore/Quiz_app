"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = mongoose_1.default.Schema;
//schema
const favQuestionSchema = new schema({
    userId: {
        type: mongoose_1.default.Types.ObjectId
    },
    question: {
        type: String,
        required: true
    },
    options: {}
});
const favQuestion = mongoose_1.default.model("FavouriteQuestion", favQuestionSchema);
exports.default = favQuestion;
