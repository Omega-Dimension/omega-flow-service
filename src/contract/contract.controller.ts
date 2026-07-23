import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractQueryDto } from './dto/query.dto';

/**
 * Contract Controller
 * ---------------------------------------------------
 * Handles all contract related HTTP requests
 */

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  /**
   * Create contract
   * POST /contracts/:user_id
   */
  @Post(':user_id')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('user_id') user_id: string,
    @Body() createContractDto: CreateContractDto,
  ) {
    return this.contractService.create(user_id, createContractDto);
  }

  /**
   * Get all contracts
   * GET /contracts
   */
  @Get()
  findAll(@Query() query: ContractQueryDto) {
    return this.contractService.findAll(query);
  }

  /**
   * Get single contract
   * GET /contracts/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  /**
   * Update contract
   * PATCH /contracts/:id
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(id, updateContractDto);
  }

  /**
   * Delete contract
   * DELETE /contracts/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}