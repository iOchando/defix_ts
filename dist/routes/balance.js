"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const balance_controller_1 = require("../controllers/balance.controller");
const router = (0, express_1.Router)();
exports.router = router;
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
router.get("/get-cryptos", balance_controller_1.getCryptos);
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
router.get("/get-cryptos-swap", balance_controller_1.getCryptosSwap);
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
router.post("/get-balance/", balance_controller_1.getBalance);
