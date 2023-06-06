import { Request, Response, Router } from "express";
import {
  getCloseAllSesions,
  closeAllSessions,
  setEmailData,
  getEmailData,
} from "../controllers/user.controller";

const router = Router();

/**
 * Post track
 * @swagger
 * /close-all-sessions/:
 *    post:
 *      tags:
 *        - User
 *      summary: Cerrar todas las sesiones abiertas.
 *      description: Manda el defixId y el SeedPhrase para mandar a cerrar todas las sesiones.
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
 *          description: Buena respuesta.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/close-all-sessions/", closeAllSessions);

/**
 * Post track
 * @swagger
 * /get-close-all-sessions/:
 *    post:
 *      tags:
 *        - User
 *      summary: Obtiene un boolean si el usuario mando a cerrar todas las sesiones.
 *      description: Si el boolean es True se tiene que cerrar la sesion, normalmente debe estar siempre en false.
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
 *          description: Responde boolean.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/get-close-all-sessions/", getCloseAllSesions);

// defixId, seedPhrase, email, flag_send, flag_receive, flag_dex, flag_fiat, name, last_name, legal_document, type_document
/**
 * Post track
 * @swagger
 * /set-email-data/:
 *    post:
 *      tags:
 *        - User
 *      summary: Manda toda la funcion al backend para ser guardada.
 *      description: Siempre mandar todos los campos, si no seran guardados como nulos.
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
 *                  name: {
 *                    type: "string"
 *                  },
 *                  last_name: {
 *                    type: "string"
 *                  },
 *                  legal_document: {
 *                    type: "string"
 *                  },
 *                  type_document: {
 *                    type: "string"
 *                  },
 *                  flag_send: {
 *                    type: "boolean"
 *                  },
 *                  flag_receive: {
 *                    type: "boolean"
 *                  },
 *                  flag_dex: {
 *                    type: "boolean"
 *                  },
 *                  flag_fiat: {
 *                    type: "boolean"
 *                  },
 *                }
 *      responses:
 *        '200':
 *          description: Success.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/set-email-data/", setEmailData);

/**
 * Post track
 * @swagger
 * /get-email-data/:
 *    post:
 *      tags:
 *        - User
 *      summary: Obtiene la data de configuracion del usuario.
 *      description: Obtiene data del defixId enviado.
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
 *          description: Responde objeto con la data.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/get-email-data/", getEmailData);

export { router };
