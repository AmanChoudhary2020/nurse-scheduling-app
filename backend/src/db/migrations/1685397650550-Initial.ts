import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1685397650550 implements MigrationInterface {
    name = 'Initial1685397650550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`schedules\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`shifts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`type\` varchar(10) NOT NULL, \`nurseId\` int NULL, \`scheduleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nurses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(500) NOT NULL, \`preferences\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`shifts\` ADD CONSTRAINT \`FK_c80647169d1aa7c0388cbb055a1\` FOREIGN KEY (\`nurseId\`) REFERENCES \`nurses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shifts\` ADD CONSTRAINT \`FK_99de60c4b123a0bc1b2126c530b\` FOREIGN KEY (\`scheduleId\`) REFERENCES \`schedules\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shifts\` DROP FOREIGN KEY \`FK_99de60c4b123a0bc1b2126c530b\``);
        await queryRunner.query(`ALTER TABLE \`shifts\` DROP FOREIGN KEY \`FK_c80647169d1aa7c0388cbb055a1\``);
        await queryRunner.query(`DROP TABLE \`nurses\``);
        await queryRunner.query(`DROP TABLE \`shifts\``);
        await queryRunner.query(`DROP TABLE \`schedules\``);
    }

}
