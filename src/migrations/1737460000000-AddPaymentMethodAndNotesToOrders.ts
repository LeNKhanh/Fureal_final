import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaymentMethodAndNotesToOrders1737460000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'payment_method',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: "'COD'",
      }),
    );

    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'notes',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'notes');
    await queryRunner.dropColumn('orders', 'payment_method');
  }
}
