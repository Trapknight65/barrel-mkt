import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule { }
