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
exports.connectDB = connectDB;
const mongodb_1 = require("mongodb");
const uri = process.env.DATABASE_LINK || "";
let client;
let db;
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (db)
            return db;
        try {
            client = new mongodb_1.MongoClient(uri, {
                serverApi: {
                    version: mongodb_1.ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true
                }
            });
            yield client.connect();
            db = client.db("gerador_de_assinatura");
            console.log("Conectado ao MongoDB Atlas");
            return db;
        }
        catch (error) {
            console.error("Erro ao conectar no MongoDB:", error);
            throw error;
        }
    });
}
