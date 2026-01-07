import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordToUser1767753700683 implements MigrationInterface {
    name = 'AddPasswordToUser1767753700683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
    }

}
