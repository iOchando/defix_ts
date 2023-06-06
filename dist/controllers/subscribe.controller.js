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
exports.setEmailSubscribe = void 0;
const subscribe_entity_1 = require("../entities/subscribe.entity");
const utils_1 = require("../helpers/utils");
function setEmailSubscribe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            if (yield (0, utils_1.validateEmail)(email)) {
                const subs = new subscribe_entity_1.Subscribe();
                subs.email = email;
                const saved = yield subs.save();
                if (saved)
                    return res.send(true);
                return res.status(400).send();
            }
            else {
                return res.status(400).send();
            }
        }
        catch (error) {
            return res.status(500).send();
        }
    });
}
exports.setEmailSubscribe = setEmailSubscribe;
