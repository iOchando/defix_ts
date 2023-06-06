import { Request, Response, Router } from "express";
import { setEmailSubscribe } from "../controllers/subscribe.controller";

const router = Router();

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
router.post("/set-email-subscribe/", setEmailSubscribe);

export { router };
