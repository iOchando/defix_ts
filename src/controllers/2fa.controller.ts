import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { validateMnemonicDefix } from "../helpers/utils";
import { encrypt, decrypt } from "../helpers/crypto";
import { User } from "../entities/user.entity";

const generar2fa = async (req: Request, res: Response) => {
  try {
    const { defixId, seedPhrase } = req.body;

    if (!defixId || !seedPhrase) return res.status(400).send();

    const mnemonic = decrypt(seedPhrase);
    if (!mnemonic) return res.status(400).send();

    const validate = await validateMnemonicDefix(defixId, mnemonic);

    if (!validate) return res.status(400).send();

    const user = await User.findOneBy({ defix_id: defixId });

    if (!user) return res.status(400).send();

    switch (user.dosfa) {
      case true:
        {
          res.status(400).json({ respuesta: "dosfa" });
        }
        break;
      case false:
        {
          if (!user.secret) {
            const secret = authenticator.generateSecret();
            await User.update({ defix_id: user.defix_id }, { secret: secret })
              .then(() => {
                let codigo = authenticator.keyuri(
                  defixId,
                  "Defix3 App",
                  secret
                );
                QRCode.toDataURL(codigo, (err, url) => {
                  if (err) {
                    throw err;
                  }
                  res.json({ qr: url, codigo: secret });
                });
              })
              .catch(() => {
                res
                  .status(500)
                  .json({ respuesta: "error en la base de datos" });
              });
          } else {
            let codigo = authenticator.keyuri(
              defixId,
              "Defix3 App",
              user.secret
            );
            QRCode.toDataURL(codigo, (err, url) => {
              if (err) {
                throw err;
              }
              res.json({ qr: url, codigo: user.secret });
            });
          }
        }
        break;

      default:
        res.status(500).json({ respuesta: "error en el campo dosfa" });
        break;
    }
  } catch (error) {
    return res.status(500).json({ respuesta: error });
  }
};

const activar2fa = async (req: Request, res: Response) => {
  try {
    const { defixId, seedPhrase, code } = req.body;

    if (!defixId || !seedPhrase || !code) return res.status(400).send();

    const mnemonic = decrypt(seedPhrase);
    if (!mnemonic) return res.status(400).send();

    const response = await validateMnemonicDefix(defixId, mnemonic);
    if (!response) return res.status(400).send();

    const user = await User.findOneBy({ defix_id: defixId });
    if (!user) return res.status(400).send();

    if (!user.secret) return res.status(400).send({ respuesta: "secret" });

    const auth = authenticator.check(code.toString(), user.secret);
    if (!auth) return res.status(400).send({ respuesta: "code" });

    await User.update({ defix_id: user.defix_id }, { dosfa: true })
      .then(() => {
        return res.send({ respuesta: "ok" });
      })
      .catch(() => {
        return res.status(500).json({ respuesta: "error en la base de datos" });
      });
  } catch (error) {
    return res.status(500).send();
  }
};

const desactivar2fa = async (req: Request, res: Response) => {
  const { defixId, code } = req.body;
  if (!defixId || !code) return res.status(400).send();

  await validarCode2fa(code, defixId).then(async (result) => {
    switch (result) {
      case true:
        {
          // const conexion = await dbConnect();

          // const resultados = await conexion.query("select dosfa, secret from users where defix_id = $1", [defixId]);
          const user = await User.findOneBy({ defix_id: defixId });
          if (!user) return res.status(400).send();
          if (user.dosfa) {
            await User.update(
              { defix_id: user.defix_id },
              { dosfa: false, secret: undefined }
            )
              .then(() => {
                res.json({ respuesta: "ok" });
              })
              .catch(() => {
                res
                  .status(500)
                  .json({ respuesta: "error en la base de datos" });
              });
          } else {
            res.json({ respuesta: "ok" });
          }
        }
        break;
      case false:
        {
          res.status(400).json({ respuesta: "code" });
        }
        break;
      default:
        res.status(500).json({ respuesta: "error inesperado" });
        break;
    }
  });
};

const status2fa = async (req: Request, res: Response) => {
  const { defixId } = req.body;
  await status2faFn(defixId)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.status(404).send({ error: err });
    });
};

// UTILS

async function validarCode2fa(code: string, defixId: string) {
  const user = await User.findOneBy({ defix_id: defixId });
  if (!user) return false;

  const auth = authenticator.check(String(code), user.secret);
  return auth;
}

async function status2faFn(defixId: string) {
  const user = await User.findOneBy({ defix_id: defixId });
  if (!user) return false;

  return user.dosfa;
}

export {
  generar2fa,
  activar2fa,
  desactivar2fa,
  status2fa,
  validarCode2fa,
  status2faFn,
};
