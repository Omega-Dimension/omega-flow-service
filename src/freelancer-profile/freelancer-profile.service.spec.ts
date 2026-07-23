import { Test, TestingModule } from '@nestjs/testing';
import { FreelancerProfileService } from './freelancer-profile.service';

describe('FreelancerProfileService', () => {
  let service: FreelancerProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreelancerProfileService],
    }).compile();

    service = module.get<FreelancerProfileService>(FreelancerProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
