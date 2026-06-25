import { Test, TestingModule } from '@nestjs/testing';
import { TimelogController } from './timelog.controller';
import { TimelogService } from './timelog.service';

describe('TimelogController', () => {
  let controller: TimelogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimelogController],
      providers: [TimelogService],
    }).compile();

    controller = module.get<TimelogController>(TimelogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
