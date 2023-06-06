import { Request, Response, Router } from "express";
import { swapPreview, swapToken, swapTron } from "../controllers/swap.controller";

const router = Router();

/**
 * @swagger
 * /swap-preview/:
 *    post:
 *      tags:
 *        - Swap
 *      summary: Obtiene el Preview del swap, Tasa de cambio, hash y monto recibido..
 *      description: Manda campos requeridos para obtener el priceRoute.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [fromCoin, toCoin, amount, blockchain]
 *                properties: {
 *                  fromCoin: {
 *                    type: "string"
 *                  },
 *                  toCoin: {
 *                    type: "string"
 *                  },
 *                  amount: {
 *                    type: "number"
 *                  },
 *                  blockchain: {
 *                    type: "string"
 *                  },
 *                  address: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Devuelve el preview o priceRoute del swap a realizar.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/swap-preview/", swapPreview);

/**
 * @swagger
 * /swap-token/:
 *    post:
 *      tags:
 *        - Swap
 *      summary: Realiza el swap
 *      description: Manda el priceRoute obtenido anteriormente para hacer el swap.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [fromDefix, fromCoin, toCoin, pkEncrypt, priceRoute, blockchain, code]
 *                properties: {
 *                  fromDefix: {
 *                    type: "string"
 *                  },
 *                  fromCoin: {
 *                    type: "string"
 *                  },
 *                  toCoin: {
 *                    type: "string"
 *                  },
 *                  pkEncrypt: {
 *                    type: "string"
 *                  },
 *                  priceRoute: {
 *                    type: "object"
 *                  },
 *                  blockchain: {
 *                    type: "string"
 *                  },
 *                  code: {
 *                    type: "string"
 *                  },
 *                }
 *      responses:
 *        '200':
 *          description: Devuelve la transaccion del swap.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/swap-token/", swapToken);

router.post("/swap-tron/", swapTron);

export { router };
