"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const _2fa_controller_1 = require("../controllers/2fa.controller");
const router = (0, express_1.Router)();
exports.router = router;
/**
 * Post track
 * @swagger
 * /generar-2fa/:
 *    post:
 *      tags:
 *        - 2FA
 *      summary: Generar 2FA.
 *      description: Mandar defixId y seedPhrase encriptado para generar un 2fa para el usuario.
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
 *          description: Devuelve el qr y el codigo 2fa.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/generar-2fa/", _2fa_controller_1.generar2fa);
/**
 * Post track
 * @swagger
 * /activar-2fa/:
 *    post:
 *      tags:
 *        - 2FA
 *      summary: Activar 2FA.
 *      description: Activa el 2fa en la base de datos del usuario.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId, seedPhrase, code]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  },
 *                  seedPhrase: {
 *                    type: "string"
 *                  },
 *                  code: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Devuelve un ok.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/activar-2fa/", _2fa_controller_1.activar2fa);
/**
 * Post track
 * @swagger
 * /activar-2fa/:
 *    post:
 *      tags:
 *        - 2FA
 *      summary: Desactivar 2FA.
 *      description: Desactiva el 2fa en la base de datos del usuario.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId, code]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  },
 *                  code: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Devuelve un ok.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/desactivar-2fa/", _2fa_controller_1.desactivar2fa);
/**
 * Post track
 * @swagger
 * /status-2fa/:
 *    post:
 *      tags:
 *        - 2FA
 *      summary: Status 2FA.
 *      description: Te da un Status del 2FA del usuario.
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
 *          description: Devuelve un boolean si el 2FA esta activo o no.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/status-2fa/", _2fa_controller_1.status2fa);
