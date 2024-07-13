import { MigrationInterface, QueryRunner } from "typeorm"
import { seed } from "../seeds/seed.initial";

export class InitialSeed1685397666316 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await seed(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
