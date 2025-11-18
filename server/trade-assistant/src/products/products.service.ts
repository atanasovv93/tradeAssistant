/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { Product, ProductCategory } from '../entities/product.entity';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(createDto: CreateProductDto): Promise<Product> {
  // ✅ Проверка дали category е валидна
  if (!Object.values(ProductCategory).includes(createDto.category as ProductCategory)) {
    throw new BadRequestException(`Invalid category: ${createDto.category}`);
  }

  const product = this.productRepo.create(createDto);
  return this.productRepo.save(product);
}

  async findAll(query?: {
    search?: string;
    category?: string;
    nearExpireDays?: number;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.search) {
      where.name = ILike(`%${query.search}%`);
    }

    if (query?.category) {
      where.category = query.category;
    }

    if (query?.nearExpireDays) {
      const now = new Date();
      const until = new Date();
      until.setDate(now.getDate() + query.nearExpireDays);
      where.expirationDate = Between(now, until);
    }

    const [items, total] = await this.productRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return { deleted: true };
  }

  async totalValue(mode: 'purchase' | 'sale' = 'purchase') {
    const products = await this.productRepo.find();
    const total = products.reduce((sum, p) => {
      const price = mode === 'purchase' ? Number(p.purchasePrice) : Number(p.salePrice);
      return sum + price * Number(p.quantity);
    }, 0);
    return { mode, total };
  }
}
