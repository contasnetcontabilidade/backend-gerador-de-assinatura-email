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
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.deleteLocalFile = deleteLocalFile;
// src/services/deleteLocalFile.ts
const fs_1 = require("fs");
const config_1 = require("../cloudinary/config");
function deleteFromCloudinary(publicId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield config_1.cloud.uploader.destroy(publicId);
            return result;
        }
        catch (error) {
            console.error("Erro ao apagar do Cloudinary", error);
            throw error;
        }
    });
}
function deleteLocalFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.unlink(path);
        }
        catch (error) {
            if (error.code !== "ENOENT") {
                console.error("Erro ao apagar arquivo local", error);
            }
        }
    });
}
