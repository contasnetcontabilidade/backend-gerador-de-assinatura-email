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
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const config_1 = require("../database/config");
function createUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const userCollection = db.collection("users");
            const result = yield userCollection.insertOne(data);
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum error no Model: createUser", error);
            throw error;
        }
    });
}
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const userCollection = db.collection("users");
            const result = yield userCollection.find().toArray();
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum error no Model: getAllUsers", error);
            throw error;
        }
    });
}
function getUserByName(nome) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const userCollection = db.collection("users");
            const result = yield userCollection.findOne({ nome: nome });
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum error no Model: getUserByName", error);
            throw error;
        }
    });
}
function updateUser(_id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const userCollection = db.collection("users");
            const result = yield userCollection.updateOne({ _id: new mongodb_1.ObjectId(_id) }, { $set: data });
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum error no Model: updateUser", error);
            throw error;
        }
    });
}
function deleteUser(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const userCollection = db.collection("users");
            const result = yield userCollection.deleteOne({ _id: new mongodb_1.ObjectId(_id) });
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum error no Model: deleteUser", error);
            throw error;
        }
    });
}
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const userCollection = db.collection("users");
            const result = yield userCollection.findOne({ email: email });
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum error no Model: getUserByEmail", error);
            throw error;
        }
    });
}
function getUserById(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const userCollection = db.collection("users");
            const result = yield userCollection.findOne({ _id: new mongodb_1.ObjectId(_id) });
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum error no Model: getUserById");
            throw error;
        }
    });
}
function createTemplate(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const templateCollection = db.collection("template");
            const result = templateCollection.insertOne(data);
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum error no Model: createTemplate", error);
            throw error;
        }
    });
}
function getAllTemplates() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const templateCollection = db.collection("template");
            const result = templateCollection.find().toArray();
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum erro no Model: getAllTemplates", error);
            throw error;
        }
    });
}
function getTemplateById(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const templateCollection = db.collection("template");
            const result = templateCollection.findOne({ _id: new mongodb_1.ObjectId(_id) });
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum erro no Model: getTemplateById", error);
            throw error;
        }
    });
}
function updateTemplate(_id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, config_1.connectDB)();
            const templateCollection = db.collection("template");
            const result = templateCollection.updateOne({ _id: new mongodb_1.ObjectId(_id) }, { $set: data });
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum erro no model: updateTemplate", error);
            throw error;
        }
    });
}
function deleteTemplate(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = (0, config_1.connectDB)();
            const templateCollection = (yield db).collection("template");
            const result = templateCollection.deleteOne({ _id: new mongodb_1.ObjectId(_id) });
            return result;
        }
        catch (error) {
            console.error("Ocorreu algum erro no model: deleteTemplate", error);
            throw error;
        }
    });
}
exports.default = {
    createUser,
    getAllUsers,
    getUserByName,
    updateUser,
    deleteUser,
    getUserByEmail,
    getUserById,
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
};
