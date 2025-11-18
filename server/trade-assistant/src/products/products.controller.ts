/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 📦 Get all products (with pagination + filters)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('nearExpireDays') nearExpireDays?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.findAll({
      search,
      category,
      nearExpireDays: Number(nearExpireDays),
      page: Number(page),
      limit: Number(limit),
    });
  }

  // 💰 Get total warehouse value
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('total-value')
  getTotalValue(@Query('mode') mode: 'purchase' | 'sale' = 'purchase') {
    return this.productsService.totalValue(mode);
  }

  // 🔍 Get single product
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  // ➕ Create (admin or manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // ✏️ Update
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  // ❌ Delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }
}
