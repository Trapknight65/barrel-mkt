import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupplierService } from './supplier.service';

@Module({
  imports: [ConfigModule],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule { }
