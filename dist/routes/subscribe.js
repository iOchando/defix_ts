"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const subscribe_controller_1 = require("../controllers/subscribe.controller");
const router = (0, express_1.Router)();
exports.router = router;
/**
 * Post track
 * @swagger
 * /set-email-subscribe/:
 *    post:
 *      tags:
 *        - Subscribe
 *      summary: Enviar correo para subscribirse a Defix3.
 *      description: Registrar correo.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [email]
 *                properties: {
 *                  email: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Success.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/set-email-subscribe/", subscribe_controller_1.setEmailSubscribe);
