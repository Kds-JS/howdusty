import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contributor } from './entity/contributor.entity';
import { Repository } from 'typeorm';
import { ContributorDto } from './dto';

@Injectable()
export class ContributorsService {
  constructor(
    @InjectRepository(Contributor)
    private contributorsRepository: Repository<Contributor>,
  ) {}

  findAll(): Promise<Contributor[]> {
    return this.contributorsRepository.find();
  }

  async save(contributorDto: ContributorDto): Promise<Contributor> {
    return await this.contributorsRepository.save(contributorDto);
  }
}
