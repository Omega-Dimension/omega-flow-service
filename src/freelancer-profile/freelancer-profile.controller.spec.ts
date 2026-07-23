import { Test, TestingModule } from '@nestjs/testing';
import { FreelancerProfileController } from './freelancer-profile.controller';
import { FreelancerProfileService } from './freelancer-profile.service';

describe('FreelancerProfileController', () => {
  let controller: FreelancerProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreelancerProfileController],
      providers: [FreelancerProfileService],
    }).compile();

    controller = module.get<FreelancerProfileController>(FreelancerProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
