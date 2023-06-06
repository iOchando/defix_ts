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
exports.migration1676486312620 = void 0;
class migration1676486312620 {
    constructor() {
        this.name = 'migration1676486312620';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "from_defix" character varying, "from_address" character varying, "to_defix" character varying, "to_address" character varying, "coin" character varying, "blockchain" character varying, "value" character varying, "hash" character varying, "tipo" character varying, "date_year" character varying, "date_month" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "from_defix"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "from_address"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "to_defix"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "to_address"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "value"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "hash"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "tipo"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "date_year"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "date_month"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "created_at"`);
            yield queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "updated_at"`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "balances" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "date_month" character varying`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "date_year" character varying`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "tipo" character varying`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "hash" character varying`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "value" character varying`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "to_address" character varying`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "to_defix" character varying`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "from_address" character varying`);
            yield queryRunner.query(`ALTER TABLE "balances" ADD "from_defix" character varying`);
            yield queryRunner.query(`DROP TABLE "transactions"`);
        });
    }
}
exports.migration1676486312620 = migration1676486312620;
