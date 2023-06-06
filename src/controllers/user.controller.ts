import { Request, Response } from "express";
import { validateDefixId, validateMnemonicDefix } from "../helpers/utils";
import { status2faFn, validarCode2fa } from "./2fa.controller";
import { encrypt, decrypt } from "../helpers/crypto";
import { User } from "../entities/user.entity";
import AppDataSource from "../config/data.source";
import dataSource from "../config/data.source";

const setEmailData = async (req: Request, res: Response) => {
  const { defixId } = req.body;

  const DefixId = defixId.toLowerCase();

  status2faFn(DefixId).then((respStatus) => {
    switch (respStatus) {
      case true:
        {
          const { code } = req.body;
          validarCode2fa(code, DefixId).then((respValidacion) => {
            console.log(respValidacion);
            switch (respValidacion) {
              case true: {
                return EjecutarsetEmailData(req, res);
              }
              case false:
                {
                  res.json({ respuesta: "code" });
                }
                break;
              default:
                res
                  .status(500)
                  .json({ respuesta: "Error interno del sistema" });
                break;
            }
          });
        }
        break;
      case false: {
        return EjecutarsetEmailData(req, res);
      }
      default:
        res.status(500).json({ respuesta: "Error interno del sistema" });
        break;
    }
  });
};

async function EjecutarsetEmailData(req: Request, res: Response) {
  try {
    const {
      defixId,
      seedPhrase,
      email,
      flag_send,
      flag_receive,
      flag_dex,
      flag_fiat,
      name,
      last_name,
      legal_document,
      type_document,
    } = req.body;

    const mnemonic = decrypt(seedPhrase);
    if (!mnemonic) return res.status(400).send();

    const user = await User.findOneBy({ defix_id: defixId });
    if (!user) return res.status(400).send();

    const response = await validateMnemonicDefix(defixId, mnemonic);

    if (legal_document == !null) {
      if (type_document == !"v" && type_document == !"j") {
        return res.status(400).send({ response: "Error tipo de documento" });
      }
    }

    if (!response) return res.status(400).send();

    await User.update(
      { defix_id: user.defix_id },
      {
        email: email,
        name: name,
        lastname: last_name,
        legal_document: legal_document,
        type_document: type_document,
        flag_send: flag_send,
        flag_receive: flag_receive,
        flag_dex: flag_dex,
        flag_fiat: flag_fiat,
      }
    );

    res.status(200).send();
  } catch (error) {
    return res.status(500).send();
  }
}

const getEmailData = async (req: Request, res: Response) => {
  try {
    const { defixId } = req.body;

    const userData = await dataSource
      .createQueryBuilder(User, "user")
      .select([
        "user.defix_id",
        "user.email",
        "user.flag_send",
        "user.flag_receive",
        "user.flag_dex",
        "user.flag_fiat",
        "user.name",
        "user.lastname",
        "user.legal_document",
        "user.type_document",
        "user.dosfa",
      ])
      .where("user.defix_id = :defixId", { defixId: defixId })
      .getOne();

    if (!userData) return res.status(400).send();

    res.send(userData);
  } catch (error) {
    return res.status(500).send();
  }
};

const closeAllSessions = async (req: Request, res: Response) => {
  try {
    const { defixId, seedPhrase } = req.body;

    const DefixId = defixId.toLowerCase();

    const user = await User.findOneBy({ defix_id: DefixId });
    if (!user) return res.status(400).send();

    const mnemonic = decrypt(seedPhrase);
    if (!mnemonic) return res.status(400).send();

    const response = await validateMnemonicDefix(DefixId, mnemonic);

    console.log(response);

    if (!response) return res.status(404).send();

    const result = await User.update(
      { defix_id: defixId },
      { close_sessions: true }
    );

    res.send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

const getCloseAllSesions = async (req: Request, res: Response) => {
  try {
    const { defixId } = req.body;

    const user = await User.findOneBy({ defix_id: defixId.toLowerCase() });
    if (!user) return res.status(400).send();

    res.send(user.close_sessions);
  } catch (error) {
    return res.status(500).send();
  }
};

export { getCloseAllSesions, closeAllSessions, setEmailData, getEmailData };
