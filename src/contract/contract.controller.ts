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
  UseGuards,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractQueryDto } from './dto/query.dto';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

/**
 * Contract Controller
 * ---------------------------------------------------
 * Handles all contract related HTTP requests
 */

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  /**
   * Create contract
   * POST /contracts/:user_id
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser() user: JwtUser, 
    @Body() createContractDto: CreateContractDto,
  ) {
    return this.contractService.create(user.id, createContractDto);
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
    @GetUser() user : JwtUser,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(user.id, updateContractDto);
  }

  /**
   * Delete contract
   * DELETE /contracts/:id
   */
  @Delete(':id')
  remove(@GetUser() user : JwtUser) {
    return this.contractService.remove(user.id);
  }
}
