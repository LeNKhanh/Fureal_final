import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Entities
import { User } from './modules/users/entities/user.entity';
import { Role } from './modules/roles/entities/role.entity';
import { AuthProvider } from './modules/auth/entities/auth-provider.entity';
import { Product } from './modules/products/entities/product.entity';
import { ProductImage } from './modules/product-images/entities/product-image.entity';
import { Category } from './modules/categories/entities/category.entity';
import { CategoryGroup } from './modules/category-groups/entities/category-group.entity';
import { Cart } from './modules/carts/entities/cart.entity';
import { CartItem } from './modules/cart-items/entities/cart-item.entity';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/order-items/entities/order-item.entity';
import { OrderStatusHistory } from './modules/order-status-history/entities/order-status-history.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Address } from './modules/addresses/entities/address.entity';
import { InventoryLog } from './modules/inventory-logs/entities/inventory-log.entity';
import { AuditLog } from './modules/audit-logs/entities/audit-log.entity';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CategoryGroupsModule } from './modules/category-groups/category-groups.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { HealthModule } from './modules/health/health.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          User,
          Role,
          AuthProvider,
          Product,
          ProductImage,
          Category,
          CategoryGroup,
          Cart,
          CartItem,
          Order,
          OrderItem,
          OrderStatusHistory,
          Payment,
          Address,
          InventoryLog,
          AuditLog,
        ],
        synchronize: false, // Never use true in production
        logging: configService.get('app.env') === 'development',
        // SSL required for cloud databases
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    CategoryGroupsModule,
    CategoriesModule,
    ProductsModule,
    CartsModule,
    OrdersModule,
    AddressesModule,
    AuditLogsModule,
    HealthModule,
    AiModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
