import { MigrationInterface, QueryRunner } from "typeorm";

export class chartV221615966519402 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "__chart__active_users" ADD "___local_users" character varying array NOT NULL DEFAULT '{}'::varchar[]`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__active_users" ADD "___remote_users" character varying array NOT NULL DEFAULT '{}'::varchar[]`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__hashtag" ADD "___local_users" character varying array NOT NULL DEFAULT '{}'::varchar[]`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__hashtag" ADD "___remote_users" character varying array NOT NULL DEFAULT '{}'::varchar[]`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__test_unique" ADD "___foo" character varying array NOT NULL DEFAULT '{}'::varchar[]`,
		);
	}
	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "__chart__test_unique" DROP COLUMN "___foo"`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__hashtag" DROP COLUMN "___remote_users"`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__hashtag" DROP COLUMN "___local_users"`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__active_users" DROP COLUMN "___remote_users"`,
		);
		await queryRunner.query(
			`ALTER TABLE "__chart__active_users" DROP COLUMN "___local_users"`,
		);
	}
}
