import multer from "multer";
import path from "path";

const uploadFolder = path.resolve(__dirname, "..", "..", "uploads");

export const upload = multer({
    dest: uploadFolder
});
