import { Db, MongoClient, ServerApiVersion } from "mongodb"
const uri = process.env.DATABASE_LINK || "";

let client;
let db: Db;

export async function connectDB() {
    if (db) return db;

    try {
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });

        await client.connect();
        db = client.db("gerador_de_assinatura");

        console.log("Conectado ao MongoDB Atlas");

        return db;
    } catch (error) {
        console.error("Erro ao conectar no MongoDB:", error);
        throw error;
    }
}
