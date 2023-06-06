"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const swap_controller_1 = require("../controllers/swap.controller");
const router = (0, express_1.Router)();
exports.router = router;
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
router.post("/swap-preview/", swap_controller_1.swapPreview);
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
router.post("/swap-token/", swap_controller_1.swapToken);
router.post("/swap-tron/", swap_controller_1.swapTron);
