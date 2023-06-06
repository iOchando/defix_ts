import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1676647093403 implements MigrationInterface {
    name = 'migration1676647093403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscribe" ("id" SERIAL NOT NULL, "email" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ccd17da54ad3367a752be476971" UNIQUE ("email"), CONSTRAINT "PK_3e91e772184cd3feb30688ef1b8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "subscribe"`);
    }

}
