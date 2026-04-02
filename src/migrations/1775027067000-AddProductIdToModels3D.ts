import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddProductIdToModels3D1775027067000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('models_3d');
    const hasColumn = table?.columns.find((c) => c.name === 'product_id');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'models_3d',
        new TableColumn({
          name: 'product_id',
          type: 'uuid',
          isNullable: true,
        }),
      );

      await queryRunner.createIndex(
        'models_3d',
        new TableIndex({
          name: 'idx_models3d_product',
          columnNames: ['product_id'],
        }),
      );

      await queryRunner.createForeignKey(
        'models_3d',
        new TableForeignKey({
          name: 'fk_models3d_product',
          columnNames: ['product_id'],
          referencedTableName: 'products',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('models_3d');
    const fk = table?.foreignKeys.find((f) => f.columnNames.includes('product_id'));
    if (fk) {
      await queryRunner.dropForeignKey('models_3d', fk);
    }
    const idx = table?.indices.find((i) => i.columnNames.includes('product_id'));
    if (idx) {
      await queryRunner.dropIndex('models_3d', idx);
    }
    const col = table?.columns.find((c) => c.name === 'product_id');
    if (col) {
      await queryRunner.dropColumn('models_3d', 'product_id');
    }
  }
}
