import { ObjectId } from "mongodb";
import { connectDB } from "../database/config";

async function createUser(data: {
  nome: string;
  email: string;
  hashedPassword: string;
  user_type: string;
}) {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");
    const result = await userCollection.insertOne(data);
    return result;
  } catch (error) {
    console.error("Ocorreu algum error no Model: createUser", error);
    throw error;
  }
}

async function getAllUsers() {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");
    const result = await userCollection.find().toArray();
    return result;
  } catch (error) {
    console.error("Ocorreu algum error no Model: getAllUsers", error);
    throw error;
  }
}

async function getUserByName(nome: string) {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");
    const result = await userCollection.findOne({ nome: nome });
    return result;
  } catch (error) {
    console.error("Ocorreu algum error no Model: getUserByName", error);
    throw error;
  }
}

async function updateUser(
  _id: string,
  data: Partial<{
    nome: string;
    hashedPassword: string;
  }>
) {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");
    const result = await userCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: data }
    );
    return result;
  } catch (error) {
    console.error("Ocorreu algum error no Model: updateUser", error);
    throw error;
  }
}

async function deleteUser(_id: string) {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");
    const result = await userCollection.deleteOne({ _id: new ObjectId(_id) });
    return result;
  } catch (error) {
    console.error("Ocorreu algum error no Model: deleteUser", error);
    throw error;
  }
}

async function getUserByEmail(email: string) {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");
    const result = await userCollection.findOne({ email: email });
    return result;
  } catch (error) {
    console.error("Ocorreu algum error no Model: getUserByEmail", error);
    throw error;
  }
}
async function getUserById(_id: string) {
  try {
    const db = await connectDB();
    const userCollection = db.collection("users");
    const result = await userCollection.findOne({ _id: new ObjectId(_id) });
    return result;
  } catch (error) {
    console.error("Ocorreu algum error no Model: getUserById");
    throw error;
  }
}

// Template Model Functions

async function createTemplate(data: {
  nome: string;
  containerBorderColor?: string;
  imgBorderColor?: string;
  divisionBarColor?: string;
  nomeColor?: string;
  setorColor?: string;
  iconsColor?: string;
  infoColor?: string;
  backgroundImg?: string;
  backgroundId?: string;
  logoContas?: string;
  logoContasId?: string;
  isActive?: boolean;
}) {
  try {
    const db = await connectDB();
    const templateCollection = db.collection("template");
    const { isActive = true, ...rest } = data;
    const templateData = { ...rest, isActive };
    const result = templateCollection.insertOne(templateData);
    return result;
  } catch (error) {
    console.error("Ocorreu algum error no Model: createTemplate", error);
    throw error;
  }
}

async function getAllTemplates() {
  try {
    const db = await connectDB();
    const templateCollection = db.collection("template");
    const result = templateCollection.find().toArray();
    return result;
  } catch (error) {
    console.error("Ocorreu algum erro no Model: getAllTemplates", error);
    throw error;
  }
}

async function getTemplateById(_id: string) {
  try {
    const db = await connectDB();
    const templateCollection = db.collection("template");
    const result = templateCollection.findOne({ _id: new ObjectId(_id) });
    return result;
  } catch (error) {
    console.error("Ocorreu algum erro no Model: getTemplateById", error);
    throw error;
  }
}

async function updateTemplate(
  _id: string,
  data: Partial<{
    nome: string;
    containerBorderColor: string;
    imgBorderColor: string;
    divisionBarColor: string;
    nomeColor: string;
    setorColor: string;
    iconsColor: string;
    infoColor: string;
    backgroundImg: string;
    backgroundId: string;
    logoContas: string;
    logoContasId: string;
    isActive: boolean;
  }>
) {
  try {
    const db = await connectDB();
    const templateCollection = db.collection("template");
    const result = templateCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: data }
    );
    return result;
  } catch (error) {
    console.error("Ocorreu algum erro no model: updateTemplate", error);
    throw error;
  }
}

async function deleteTemplate(_id: string) {
  try {
    const db = connectDB();
    const templateCollection = (await db).collection("template");
    const result = templateCollection.deleteOne({ _id: new ObjectId(_id) });
    return result;
  } catch (error) {
    console.error("Ocorreu algum erro no model: deleteTemplate", error);
    throw error;
  }
}

export default {
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
