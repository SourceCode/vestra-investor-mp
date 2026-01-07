import { MigrationInterface, QueryRunner } from "typeorm";

export class InvestorProfile1767755458403 implements MigrationInterface {
    name = 'InvestorProfile1767755458403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."investor_profiles_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TYPE "public"."investor_profiles_accreditationstatus_enum" AS ENUM('ACCREDITED', 'NON_ACCREDITED', 'UNKNOWN')`);
        await queryRunner.query(`CREATE TABLE "investor_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."investor_profiles_status_enum" NOT NULL DEFAULT 'PENDING', "accreditationStatus" "public"."investor_profiles_accreditationstatus_enum" NOT NULL DEFAULT 'UNKNOWN', "investmentPreferences" text, "totalOffersMade" integer NOT NULL DEFAULT '0', "dealsViewed" integer NOT NULL DEFAULT '0', "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_732da4f9018a4454ec2a100098" UNIQUE ("userId"), CONSTRAINT "PK_154d889a096b3948f856b4ca53f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "investor_profiles" ADD CONSTRAINT "FK_732da4f9018a4454ec2a100098d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "investor_profiles" DROP CONSTRAINT "FK_732da4f9018a4454ec2a100098d"`);
        await queryRunner.query(`DROP TABLE "investor_profiles"`);
        await queryRunner.query(`DROP TYPE "public"."investor_profiles_accreditationstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."investor_profiles_status_enum"`);
    }

}
