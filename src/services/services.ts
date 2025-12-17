// src/services/deleteLocalFile.ts
import { promises as fs } from "fs";

import { cloud } from "../cloudinary/config";

export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloud.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Erro ao apagar do Cloudinary", error);
    throw error;
  }
}

export async function deleteLocalFile(path: string) {
  try {
    await fs.unlink(path);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error("Erro ao apagar arquivo local", error);
    }
  }
}
