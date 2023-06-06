import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1676486242848 implements MigrationInterface {
    name = 'migration1676486242848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "defix_id" character varying, "email" character varying, "import_id" character varying, "name" character varying, "lastname" character varying, "close_sessions" boolean DEFAULT true, "dosfa" boolean DEFAULT true, "legal_document" character varying, "type_document" character varying, "secret" character varying, "flag_send" boolean, "flag_receive" boolean, "flag_dex" boolean, "flag_fiat" boolean, CONSTRAINT "UQ_5b4b4aa7a7fa89043d7f1ecc415" UNIQUE ("defix_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_4761723de32da9c56d745ecdacc" UNIQUE ("import_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "name" character varying, "address" character varying, "userId" integer, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "suscribe" ("id" SERIAL NOT NULL, "email" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_aa95ed8913609aa79e402f712d7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "balances" ("id" SERIAL NOT NULL, "blockchain" character varying, "coin" character varying, "balance" double precision DEFAULT '0', "userId" integer, CONSTRAINT "PK_74904758e813e401abc3d4261c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "balance" double precision DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "from_defix" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "from_address" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "to_defix" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "to_address" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "value" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "hash" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "tipo" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "date_year" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "date_month" character varying`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "balances" ADD CONSTRAINT "FK_414a454532d03cd17f4ef40eae2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "balances" DROP CONSTRAINT "FK_414a454532d03cd17f4ef40eae2"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "date_month"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "date_year"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "tipo"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "hash"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "to_address"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "to_defix"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "from_address"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "from_defix"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "balances" ADD "balance" double precision DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "balances"`);
        await queryRunner.query(`DROP TABLE "suscribe"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
