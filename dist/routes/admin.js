"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_1 = __importDefault(require("../middleware/admin"));
const router = (0, express_1.Router)();
exports.router = router;
router.get("/get-users-defix", admin_1.default, admin_controller_1.getUsersDefix);
