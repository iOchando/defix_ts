import { Request, Response, Router } from "express";
import { getCryptos, getBalance, getCryptosSwap } from "../controllers/balance.controller";

const router = Router();

/**
 * Post track
 * @swagger
 * /get-cryptos:
 *    get:
 *      tags:
 *        - Balance
 *      summary: Obtiene las Cryptos y Tokens permitidos en Defix3.
 *      description: Te da un array con las cryptos y tokens.
 *      responses:
 *        '200':
 *          description: Array con las cryptos y tokens.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.get("/get-cryptos", getCryptos);

/**
 * Post track
 * @swagger
 * /get-cryptos-swap:
 *    get:
 *      tags:
 *        - Balance
 *      summary: Obtiene las Cryptos y Tokens con swap permitidos en Defix3.
 *      description: Te da un array con las cryptos y tokens.
 *      responses:
 *        '200':
 *          description: Array con las cryptos y tokens.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.get("/get-cryptos-swap", getCryptosSwap);

/**
 * Post track
 * @swagger
 * /get-balance/:
 *    post:
 *      tags:
 *        - Balance
 *      summary: Obtener balance de un Usuario.
 *      description: Mandar defixId y te dara el balance de ese usuario, con todos las cryptos y tokens.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Array con balance de todas las cryptos del usuario.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/get-balance/", getBalance);

export { router };
