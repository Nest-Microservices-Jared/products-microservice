import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService')


  onModuleInit() {
      this.$connect();
      this.logger.log("Database connected");
  }

  create(createProductDto: CreateProductDto) {

    return this.product.create({
      data: createProductDto
    })

  }

  async findAll(paginationDto:PaginationDto) {

    const {page = 1, limit = 10} = paginationDto;

    const totalResults = await this.product.count({ where: { available:true } });
    const lastPage = Math.ceil(totalResults/limit);

    return {
      data : await this.product.findMany({
        skip:(page-1)*limit,
        take:limit,
        where : {available:true}
      }),
      meta : {
        total: totalResults,
        currentPage : page,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const productFound =  await this.product.findFirst({
      where:{ id:id, available:true }
    });

    if(!productFound){
      throw new NotFoundException(`Product with id: #${id} not found`)
    }

    return productFound;

  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto;

    await this.findOne(id)

    return this.product.update({
      where: {id},
      data : data
    })
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where:{id:id},
      data: {
        available:false
      }
    });

    return product;

  }
}
