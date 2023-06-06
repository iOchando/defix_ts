import { Request, Response, Router } from "express";
import { getUsersDefix } from "../controllers/admin.controller";
import authMiddleware from "../middleware/admin";

const router = Router();

router.get("/get-users-defix", authMiddleware, getUsersDefix);

export { router };
