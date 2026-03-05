import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePartnersTable1772600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'partners',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'website_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sort_order',
            type: 'integer',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true, // ifNotExists
    );

    // Seed initial partners from static data
    await queryRunner.query(`
      INSERT INTO partners (name, is_active, sort_order) VALUES
        ('Sealy', true, 1),
        ('BOSCH', true, 2),
        ('ICC', true, 3),
        ('OPPEIN', true, 4),
        ('Lalloflex', true, 5),
        ('TEMPUR', true, 6)
      ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('partners', true);
  }
}
