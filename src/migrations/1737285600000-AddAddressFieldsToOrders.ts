import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAddressFieldsToOrders1737285600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add shipping address columns to orders table
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'shipping_address',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'receiver_name',
        type: 'varchar',
        length: '150',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'receiver_phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'receiver_phone');
    await queryRunner.dropColumn('orders', 'receiver_name');
    await queryRunner.dropColumn('orders', 'shipping_address');
  }
}
