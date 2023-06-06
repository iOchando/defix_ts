import { Request, Response, Router } from "express";
import {
  importFromPK,
  encryptAPI,
  generateMnemonicAPI,
  createWallet,
  validateDefixIdAPI,
  importWallet,
  importFromMnemonic,
  validateAddress,
  getUsers,
} from "../controllers/wallet.controller";

const router = Router();

router.post("/encrypt/", encryptAPI);

/**
 * Post track
 * @swagger
 * /import-from-pk/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Inicicar sesion con private key
 *      description: Si colocas una private key te devuelve la credencial de la blockchain
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: ["pkEncrypt"]
 *                properties: {
 *                  pkEncrypt: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Te response la credencial de la blockchain
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/import-from-pk/", importFromPK);

/**
 * Post track
 * @swagger
 * /generate-mnemonic/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Obtener Mnemonic
 *      description: Te genera un Mnemonic si el usuario esta disponible
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: ["defixId"]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Si el usuario esta disponible responde un "ok" y el seedPhrase generado, si no "user".
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: ["defixId"]
 *                properties: {
 *                  respuesta: {
 *                    type: "string"
 *                  },
 *                  seedPhrase: {
 *                    type: "string"
 *                  }
 *                }
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/generate-mnemonic/", generateMnemonicAPI);

/**
 * Post track
 * @swagger
 * /create-wallet/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Crear wallet Defix3
 *      description: Te registra y crea una wallet Defix3 con todos los address de las blockchains admitidas.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId, seedPhrase]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  },
 *                  seedPhrase: {
 *                    type: "string"
 *                  },
 *                  email: {
 *                    type: "string"
 *                  },
 *                }
 *      responses:
 *        '200':
 *          description: Responde un Json con todas las credenciales y address de la wallet.
 *        '204':
 *          description: Bad Request.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/create-wallet/", createWallet);

/**
 * Post track
 * @swagger
 * /import-wallet/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Iniciar Sesion con wallet Defix3
 *      description: Ingresa el seedPhrase y te devuelve el username defix3 y las credenciales de la wallet.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [seedPhrase]
 *                properties: {
 *                  seedPhrase: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Al igual que create, responde un Json con todas las credenciales y address de la wallet.
 *        '204':
 *          description: Bad Request.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/import-wallet/", importWallet);

/**
 * Post track
 * @swagger
 * /validate-defix3/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Validar si un usuario defix3 existe.
 *      description: Response un Boolean si el usuario existe o no.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: ["defixId"]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Responde un boolean.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/validate-defix3/", validateDefixIdAPI);

/**
 * Post track
 * @swagger
 * /import-from-mnemonic/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Crear wallet Defix3 con mnemonic.
 *      description: Te registra y crea una wallet Defix3 con el mnemonic de metamask y con las mismas addresses.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId, seedPhrase]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  },
 *                  seedPhrase: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Responde un Json con todas las credenciales y address de la wallet.
 *        '204':
 *          description: Bad Request.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/import-from-mnemonic/", importFromMnemonic);

/**
 * Post track
 * @swagger
 * /get-users:
 *    get:
 *      tags:
 *        - Wallet
 *      summary: Lista los username de los usuarios registrados.
 *      description: Responde solo el defixId de los usuarios.
 *      responses:
 *        '200':
 *          description: Responde un Array con la lista de usuarios.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.get("/get-users", getUsers);

/**
 * Post track
 * @swagger
 * /validate-address/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Validar si un address es valido.
 *      description: Valida si el address existe en la blockchain segun el coin, "BTC", "ETH", "NEAR" ...
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [address, coin]
 *                properties: {
 *                  address: {
 *                    type: "string"
 *                  },
 *                  coin: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Responde un boolean.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/validate-address/", validateAddress);

export { router };
