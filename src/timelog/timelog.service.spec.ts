import { Test, TestingModule } from '@nestjs/testing';
import { TimelogService } from './timelog.service';

describe('TimelogService', () => {
  let service: TimelogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimelogService],
    }).compile();

    service = module.get<TimelogService>(TimelogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
