import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1676486312620 implements MigrationInterface {
    name = 'migration1676486312620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "from_defix" character varying, "from_address" character varying, "to_defix" character varying, "to_address" character varying, "coin" character varying, "blockchain" character varying, "value" character varying, "hash" character varying, "tipo" character varying, "date_year" character varying, "date_month" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "from_defix"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "from_address"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "to_defix"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "to_address"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "hash"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "tipo"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "date_year"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "date_month"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "updated_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "balances" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "date_month" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "date_year" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "tipo" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "hash" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "value" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "to_address" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "to_defix" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "from_address" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "from_defix" character varying`);
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
