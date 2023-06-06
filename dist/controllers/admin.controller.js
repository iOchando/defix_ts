"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersDefix = void 0;
const user_entity_1 = require("../entities/user.entity");
const getUsersDefix = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_entity_1.User.find({ select: ["defix_id", "id"] });
        res.send(users);
    }
    catch (error) {
        res.status(404).send();
    }
});
exports.getUsersDefix = getUsersDefix;
