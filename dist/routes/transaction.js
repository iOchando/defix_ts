"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const router = (0, express_1.Router)();
exports.router = router;
/**
 * @swagger
 * /transaction/:
 *    post:
 *      tags:
 *        - Transaction
 *      summary: Hacer Transaccion.
 *      description: Manda campos requeridos para hacer una transaction.
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
 *                  pkEncrypt: {
 *                    type: "string"
 *                  },
 *                  toDefix: {
 *                    type: "string"
 *                  },
 *                  coin: {
 *                    type: "string"
 *                  },
 *                  amount: {
 *                    type: "number"
 *                  },
 *                  blockchain: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Devuelve la transaccion realizada.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/transaction/", transaction_controller_1.transaction);
/**
 * @swagger
 * /transaction-history/:
 *    post:
 *      tags:
 *        - Transaction
 *      summary: Historico de transacciones.
 *      description: Obtener historico de transacciones de un usuario.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  },
 *                  coin: {
 *                    type: "string"
 *                  },
 *                  blockchain: {
 *                    type: "string"
 *                  },
 *                  date_year: {
 *                    type: "string"
 *                  },
 *                  date_month: {
 *                    type: "string"
 *                  },
 *                  tipo: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Devuelve array de transacciones.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/transaction-history/", transaction_controller_1.getTransactionHistory);
/**
 * @swagger
 * /get-frequent/:
 *    post:
 *      tags:
 *        - Transaction
 *      summary: Obtener lista de usuarios frequentes.
 *      description: Obtener lista de usuarios frequentes de un usuario.
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
 *          description: Devuelve array de usuarios.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/get-frequent/", transaction_controller_1.getFrequent);
/**
 * @swagger
 * /delete-frequent/:
 *    post:
 *      tags:
 *        - Transaction
 *      summary: Eliminar user frequent.
 *      description: Elimina un usuario de tu lista de frequentes.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [id_frequent]
 *                properties: {
 *                  id_frequent: {
 *                    type: number
 *                  }
 *                }
 *      responses:
 *        '204':
 *          description: Eliminado con exito.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/delete-frequent/", transaction_controller_1.deleteFrequent);
