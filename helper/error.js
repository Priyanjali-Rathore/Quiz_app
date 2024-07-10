"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProjectError extends Error {
    constructor() {
        super(...arguments);
        this._status = 0;
        this._data = {};
    }
    get statusCode() {
        return this._status;
    }
    set statusCode(code) {
        this._status = code;
    }
    get data() {
        return this._data;
    }
    set data(errorData) {
        this._data = errorData;
    }
}
exports.default = ProjectError;
