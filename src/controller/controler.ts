import type { Request, Response } from "express";
import { cloud } from "../cloudinary/config";
import _default from "styled-components/dist/utils/createWarnTooManyClasses";
import type { TemplatesIds } from "../types/templatesTypes";

import bcrypt from "bcrypt";
import type { User } from "../types/usersTypes";
import model from "../model/model";
import { deleteFromCloudinary, deleteLocalFile } from "../services/services";
//
async function createUser(req: Request, res: Response) {
  try {
    const {
      nome,
      email,
      password,
      user_type = "admin",
    }: {
      nome: string;
      email: string;
      password: string;
      user_type: string;
    } = req.body;
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
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userToInsert = { nome, email, hashedPassword, user_type };
    await model.createUser(userToInsert);
    return res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (error) {
    console.error("Ocorreu algum erro no Controller: createUser", error);
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao criar usuário" });
  }
}

async function getAllUsersOrByName(req: Request, res: Response) {
  try {
    const nome = req.query.nome as string;
    if (!nome) {
      const users = await model.getAllUsers();
      return res.status(200).json(users);
    } else {
      const user = await model.getUserByName(nome);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      return res.status(200).json(user);
    }
  } catch (error) {
    console.error(
      "Ocorreu algum erro no Controller: getAllUsersOrByName",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao buscar usuário(s)" });
  }
}

async function updateUser(req: Request, res: Response) {
  // Criar endpoint ✔️
  try {
    const { _id } = req.params;
    const { nome, password }: { nome: string; password: string } = req.body;
    const userToUpdate: any = {};
    if (!_id) {
      return res.status(400).json({ message: "É necessário o id do usuário" });
    }
    if (!nome && !password) {
      return res
        .status(400)
        .json({ message: "É necessário preencher ao menos um campo" });
    }
    const userDB = (await model.getUserById(_id)) as Partial<User>;
    if (!userDB) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    if (password) {
      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Senha deve ter pelo menos 8 digitos" });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      userToUpdate.hashedPassword = hashedPassword;
    }
    if (nome) {
      userToUpdate.nome = nome;
    }
    const user = await model.updateUser(_id, userToUpdate);
    return res.status(200).json({ user });
  } catch (error) {
    console.error({
      message: "Ocorreu algum erro no Controller: updateUser",
      error,
    });
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao atualizar Usuário" });
  }
}

async function deleteUser(req: Request, res: Response) {
  // Criar endpoint ✔️
  try {
    const { _id } = req.params;
    if (!_id) {
      return res
        .status(400)
        .json({ message: "É necessário passar o id como parametro" });
    }
    const userDeleted = await model.deleteUser(_id);
    return res.status(200).json({ userDeleted });
  } catch (error) {
    console.error({
      message: "Ocorreu algum erro no Controller: deleteUser",
      error,
    });
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao deletar Usuário" });
  }
}

async function loginUser(req: Request, res: Response) {
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
    const userDB = (await model.getUserByEmail(email)) as Partial<User>;
    if (!userDB) {
      return res
        .status(404)
        .json({ message: "Usuário não cadastrado na nossa base" });
    }
    const comparePassword = bcrypt.compareSync(
      password,
      userDB.hashedPassword as string
    );
    if (!comparePassword) {
      return res.status(403).json({ message: "Senha incorreta" });
    }
    return res
      .status(200)
      .json({ message: "Usuário logado com sucesso!", user: userDB.user_type });
  } catch (error) {
    console.error("Ocorreu algum error no Controller: loginUser", error);
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao realizar o Login" });
  }
}

// Templates Controllers

async function createTemplate(req: Request, res: Response) {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const template: {
      nome: string;
      containerBorderColor?: string;
      imgBorderColor?: string;
      divisionBarColor?: string;
      nomeColor?: string;
      setorColor?: string;
      iconsColor?: string;
      infoColor?: string;
    } = req.body;
    const validacaoAoMenosUmCampo =
      !template.containerBorderColor &&
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
    const backgroundImg = files?.backgroundImg?.[0];
    const logoContas = files?.logoContas?.[0];

    let backgroundUrl: string | undefined;
    let backgroundId: string | undefined;
    let logoUrl: string | undefined;
    let logoId: string | undefined;

    if (backgroundImg) {
      const bgUpload = await cloud.uploader.upload(backgroundImg.path, {
        folder: "backgroundImg",
      });
      backgroundUrl = bgUpload.secure_url;
      backgroundId = bgUpload.public_id;
      await deleteLocalFile(backgroundImg.path);
    }
    if (logoContas) {
      const logoUpload = await cloud.uploader.upload(logoContas.path, {
        folder: "logoContas",
      });
      logoUrl = logoUpload.secure_url;
      logoId = logoUpload.public_id;
      await deleteLocalFile(logoContas.path);
    }

    const templateToSave = {
      ...template,
      backgroundImg: backgroundUrl,
      backgroundId: backgroundId,
      logoContas: logoUrl,
      logoContasId: logoId,
    };

    const templateSaved = await model.createTemplate(templateToSave);

    return res.status(201).json({
      message: "Upload feito com sucesso",
      templateSaved,
      backgroundUrl,
      logoUrl,
    });
  } catch (error) {
    console.error("Ocorreu algum erro no Controller: createTemplate", error);
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao criar template" });
  }
}

async function getAllTemplatesOrById(req: Request, res: Response) {
  try {
    const { _id } = req.params;
    if (_id) {
      const template = await model.getTemplateById(_id);
      return res.status(200).json({ template });
    } else {
      const templates = await model.getAllTemplates();
      return res.status(200).json({ templates });
    }
  } catch (error) {
    console.error(
      "Ocorreu algum erro no Controller: getAllTemplatesOrById",
      error
    );
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao tentar buscar templates" });
  }
}

async function updateTemplate(req: Request, res: Response) {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const backgroundImg = files?.backgroundImg?.[0];
    const logoContas = files?.logoContas?.[0];
    const template: {
      nome?: string;
      containerBorderColor?: string;
      imgBorderColor?: string;
      divisionBarColor?: string;
      nomeColor?: string;
      setorColor?: string;
      iconsColor?: string;
      infoColor?: string;
      isActive?: boolean;
    } = req.body;
    const { _id } = req.params;
    const validacaoAoMenosUmCampo =
      !backgroundImg &&
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
    let backgroundUrl: string | undefined;
    let logoUrl: string | undefined;
    let backgroundId: string | undefined;
    let logoId: string | undefined;
    const templateToUpdate: {
      nome?: string;
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
    } = {
      ...template,
    };
    const templateFromDB = (await model.getTemplateById(
      _id
    )) as Partial<TemplatesIds>;
    if (backgroundImg) {
      if (templateFromDB.backgroundId) {
        await deleteFromCloudinary(templateFromDB.backgroundId);
      }
      const bgUpload = await cloud.uploader.upload(backgroundImg.path, {
        folder: "backgroundImg",
      });
      backgroundUrl = bgUpload.secure_url;
      backgroundId = bgUpload.public_id;
      templateToUpdate.backgroundImg = backgroundUrl;
      templateToUpdate.backgroundId = backgroundId;

      await deleteLocalFile(backgroundImg.path);
    }
    if (logoContas) {
      if (templateFromDB.logoContasId) {
        await deleteFromCloudinary(templateFromDB.logoContasId);
      }
      const logoUpload = await cloud.uploader.upload(logoContas.path, {
        folder: "logoContas",
      });
      logoUrl = logoUpload.secure_url;
      logoId = logoUpload.public_id;
      templateToUpdate.logoContas = logoUrl;
      templateToUpdate.logoContasId = logoId;

      await deleteLocalFile(logoContas.path);
    }

    await model.updateTemplate(_id, templateToUpdate);
    return res
      .status(200)
      .json({ message: "Template atualizado com sucesso!" });
  } catch (error) {
    console.error("Ocorreu algum erro no Controller: updateTemplate", error);
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao tentar atualizar template" });
  }
}

async function deleteTemplate(req: Request, res: Response) {
  try {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).json({ message: "É necessário o parametro ID" });
    }
    const templateFromDB = (await model.getTemplateById(
      _id
    )) as Partial<TemplatesIds>;
    if (templateFromDB.backgroundId) {
      await deleteFromCloudinary(templateFromDB.backgroundId);
    }
    if (templateFromDB.logoContasId) {
      await deleteFromCloudinary(templateFromDB.logoContasId);
    }
    const templateDeleted = await model.deleteTemplate(_id);
    return res
      .status(200)
      .json({ message: "Template deleteado com sucesso:", templateDeleted });
  } catch (error) {
    console.error("Ocorreu algum erro no Controller: deleteTemplate", error);
    return res
      .status(500)
      .json({ message: "Ocorreu algum erro ao tentar deletar o template" });
  }
}

export default {
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
