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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../cloudinary/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const model_1 = __importDefault(require("../model/model"));
const services_1 = require("../services/services");
//
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { nome, email, password, user_type = "admin", } = req.body;
            if (!nome || !email || !password) {
                return res
                    .status(400)
                    .json({ message: "É necessário preencher todos os campos" });
            }
            const dominioEmail = email.split("@")[1];
            if (dominioEmail != "contas.com.br") {
                return res
                    .status(400)
                    .json({ message: "É permitido apenas o email corporativo" });
            }
            if (password.length < 8) {
                return res
                    .status(400)
                    .json({ message: "Senha deve ter pelo menos 8 digitos" });
            }
            const hashedPassword = bcrypt_1.default.hashSync(password, 10);
            const userToInsert = { nome, email, hashedPassword, user_type };
            yield model_1.default.createUser(userToInsert);
            return res.status(201).json({ message: "Usuário criado com sucesso" });
        }
        catch (error) {
            console.error("Ocorreu algum erro no Controller: createUser", error);
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao criar usuário" });
        }
    });
}
function getAllUsersOrByName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const nome = req.query.nome;
            if (!nome) {
                const users = yield model_1.default.getAllUsers();
                return res.status(200).json(users);
            }
            else {
                const user = yield model_1.default.getUserByName(nome);
                if (!user) {
                    return res.status(404).json({ message: "Usuário não encontrado" });
                }
                return res.status(200).json(user);
            }
        }
        catch (error) {
            console.error("Ocorreu algum erro no Controller: getAllUsersOrByName", error);
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao buscar usuário(s)" });
        }
    });
}
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Criar endpoint ✔️
        try {
            const { _id } = req.params;
            const { nome, password } = req.body;
            const userToUpdate = {};
            if (!_id) {
                return res.status(400).json({ message: "É necessário o id do usuário" });
            }
            if (!nome && !password) {
                return res
                    .status(400)
                    .json({ message: "É necessário preencher ao menos um campo" });
            }
            const userDB = (yield model_1.default.getUserById(_id));
            if (!userDB) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            if (password) {
                if (password.length < 8) {
                    return res
                        .status(400)
                        .json({ message: "Senha deve ter pelo menos 8 digitos" });
                }
                const hashedPassword = bcrypt_1.default.hashSync(password, 10);
                userToUpdate.hashedPassword = hashedPassword;
            }
            if (nome) {
                userToUpdate.nome = nome;
            }
            const user = yield model_1.default.updateUser(_id, userToUpdate);
            return res.status(200).json({ user });
        }
        catch (error) {
            console.error({
                message: "Ocorreu algum erro no Controller: updateUser",
                error,
            });
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao atualizar Usuário" });
        }
    });
}
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Criar endpoint ✔️
        try {
            const { _id } = req.params;
            if (!_id) {
                return res
                    .status(400)
                    .json({ message: "É necessário passar o id como parametro" });
            }
            const userDeleted = yield model_1.default.deleteUser(_id);
            return res.status(200).json({ userDeleted });
        }
        catch (error) {
            console.error({
                message: "Ocorreu algum erro no Controller: deleteUser",
                error,
            });
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao deletar Usuário" });
        }
    });
}
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Criar endpoint ✔️
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: "é necessário enviar todos os campos" });
            }
            const dominioEmail = email.split("@")[1];
            if (dominioEmail != "contas.com.br") {
                return res
                    .status(400)
                    .json({ message: "É permitido apenas o email corporativo" });
            }
            const userDB = (yield model_1.default.getUserByEmail(email));
            if (!userDB) {
                return res
                    .status(404)
                    .json({ message: "Usuário não cadastrado na nossa base" });
            }
            const comparePassword = bcrypt_1.default.compareSync(password, userDB.hashedPassword);
            if (!comparePassword) {
                return res.status(403).json({ message: "Senha incorreta" });
            }
            return res
                .status(200)
                .json({ message: "Usuário logado com sucesso!", user: userDB.user_type });
        }
        catch (error) {
            console.error("Ocorreu algum error no Controller: loginUser", error);
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao realizar o Login" });
        }
    });
}
function createTemplate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const files = req.files;
            const template = req.body;
            const validacaoAoMenosUmCampo = !template.containerBorderColor &&
                !template.divisionBarColor &&
                !template.iconsColor &&
                !template.imgBorderColor &&
                !template.infoColor &&
                !template.nomeColor &&
                !template.setorColor;
            if (!template.nome) {
                return res.status(400).json({
                    message: "Campo Nome é obrigatório",
                });
            }
            if (validacaoAoMenosUmCampo) {
                return res
                    .status(400)
                    .json({ message: "É necessário escolher ao menos uma cor" });
            }
            const backgroundImg = (_a = files === null || files === void 0 ? void 0 : files.backgroundImg) === null || _a === void 0 ? void 0 : _a[0];
            const logoContas = (_b = files === null || files === void 0 ? void 0 : files.logoContas) === null || _b === void 0 ? void 0 : _b[0];
            let backgroundUrl;
            let backgroundId;
            let logoUrl;
            let logoId;
            if (backgroundImg) {
                const bgUpload = yield config_1.cloud.uploader.upload(backgroundImg.path, {
                    folder: "backgroundImg",
                });
                backgroundUrl = bgUpload.secure_url;
                backgroundId = bgUpload.public_id;
                yield (0, services_1.deleteLocalFile)(backgroundImg.path);
            }
            if (logoContas) {
                const logoUpload = yield config_1.cloud.uploader.upload(logoContas.path, {
                    folder: "logoContas",
                });
                logoUrl = logoUpload.secure_url;
                logoId = logoUpload.public_id;
                yield (0, services_1.deleteLocalFile)(logoContas.path);
            }
            const templateToSave = Object.assign(Object.assign({}, template), { backgroundImg: backgroundUrl, backgroundId: backgroundId, logoContas: logoUrl, logoContasId: logoId });
            const templateSaved = yield model_1.default.createTemplate(templateToSave);
            return res.status(201).json({
                message: "Upload feito com sucesso",
                templateSaved,
                backgroundUrl,
                logoUrl,
            });
        }
        catch (error) {
            console.error("Ocorreu algum erro no Controller: createTemplate", error);
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao criar template" });
        }
    });
}
function getAllTemplatesOrById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { _id } = req.params;
            if (_id) {
                const template = yield model_1.default.getTemplateById(_id);
                return res.status(200).json({ template });
            }
            else {
                const templates = yield model_1.default.getAllTemplates();
                return res.status(200).json({ templates });
            }
        }
        catch (error) {
            console.error("Ocorreu algum erro no Controller: getAllTemplatesOrById", error);
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao tentar buscar templates" });
        }
    });
}
function updateTemplate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const files = req.files;
            const backgroundImg = (_a = files === null || files === void 0 ? void 0 : files.backgroundImg) === null || _a === void 0 ? void 0 : _a[0];
            const logoContas = (_b = files === null || files === void 0 ? void 0 : files.logoContas) === null || _b === void 0 ? void 0 : _b[0];
            const template = req.body;
            const { _id } = req.params;
            const validacaoAoMenosUmCampo = !backgroundImg &&
                !logoContas &&
                !template.containerBorderColor &&
                !template.divisionBarColor &&
                !template.iconsColor &&
                !template.imgBorderColor &&
                !template.infoColor &&
                !template.nomeColor &&
                !template.setorColor &&
                !template.nome;
            if (!_id) {
                return res.status(400).json({ message: "É necessário o parametro ID" });
            }
            if (validacaoAoMenosUmCampo) {
                return res
                    .status(400)
                    .json({ message: "É necessário ao menos um campo" });
            }
            let backgroundUrl;
            let logoUrl;
            let backgroundId;
            let logoId;
            const templateToUpdate = Object.assign({}, template);
            const templateFromDB = (yield model_1.default.getTemplateById(_id));
            if (backgroundImg) {
                if (templateFromDB.backgroundId) {
                    yield (0, services_1.deleteFromCloudinary)(templateFromDB.backgroundId);
                }
                const bgUpload = yield config_1.cloud.uploader.upload(backgroundImg.path, {
                    folder: "backgroundImg",
                });
                backgroundUrl = bgUpload.secure_url;
                backgroundId = bgUpload.public_id;
                templateToUpdate.backgroundImg = backgroundUrl;
                templateToUpdate.backgroundId = backgroundId;
                yield (0, services_1.deleteLocalFile)(backgroundImg.path);
            }
            if (logoContas) {
                if (templateFromDB.logoContasId) {
                    yield (0, services_1.deleteFromCloudinary)(templateFromDB.logoContasId);
                }
                const logoUpload = yield config_1.cloud.uploader.upload(logoContas.path, {
                    folder: "logoContas",
                });
                logoUrl = logoUpload.secure_url;
                logoId = logoUpload.public_id;
                templateToUpdate.logoContas = logoUrl;
                templateToUpdate.logoContasId = logoId;
                yield (0, services_1.deleteLocalFile)(logoContas.path);
            }
            yield model_1.default.updateTemplate(_id, templateToUpdate);
            return res
                .status(200)
                .json({ message: "Template atualizado com sucesso!" });
        }
        catch (error) {
            console.error("Ocorreu algum erro no Controller: updateTemplate", error);
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao tentar atualizar template" });
        }
    });
}
function deleteTemplate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { _id } = req.params;
            if (!_id) {
                return res.status(400).json({ message: "É necessário o parametro ID" });
            }
            const templateFromDB = (yield model_1.default.getTemplateById(_id));
            if (templateFromDB.backgroundId) {
                yield (0, services_1.deleteFromCloudinary)(templateFromDB.backgroundId);
            }
            if (templateFromDB.logoContasId) {
                yield (0, services_1.deleteFromCloudinary)(templateFromDB.logoContasId);
            }
            const templateDeleted = yield model_1.default.deleteTemplate(_id);
            return res
                .status(200)
                .json({ message: "Template deleteado com sucesso:", templateDeleted });
        }
        catch (error) {
            console.error("Ocorreu algum erro no Controller: deleteTemplate", error);
            return res
                .status(500)
                .json({ message: "Ocorreu algum erro ao tentar deletar o template" });
        }
    });
}
exports.default = {
    createTemplate,
    getAllTemplatesOrById,
    updateTemplate,
    deleteTemplate,
    createUser,
    getAllUsersOrByName,
    updateUser,
    deleteUser,
    loginUser,
};
