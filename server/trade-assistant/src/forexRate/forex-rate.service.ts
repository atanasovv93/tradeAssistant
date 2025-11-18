/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForexRate } from './entities/forex-rate.entity';
import { CreateForexRateDto } from './dto/create-forex-rate.dto';

@Injectable()
export class ForexRateService {
  constructor(
    @InjectRepository(ForexRate)
    private forexRepository: Repository<ForexRate>,
  ) {}

  async create(dto: CreateForexRateDto) {
  const record = this.forexRepository.create({
    ...dto,
    timestamp: dto.timestamp ?? Math.floor(Date.now() / 1000),
  });
  return this.forexRepository.save(record);
}


  async findAll() {
    return this.forexRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findLatest() {
  const [latest] = await this.forexRepository.find({
    order: { createdAt: 'DESC' },
    take: 1,
  });
  return latest;
}

async deleteById(id: number) {
  const result = await this.forexRepository.delete(id);

  if (result.affected === 0) {
    return { message: `⚠️ Forex rate with id ${id} not found.` };
  }

  return { message: `✅ Forex rate with id ${id} has been deleted.` };
}

}
