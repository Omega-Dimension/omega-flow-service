import { Injectable } from '@nestjs/common';
import { COUNTRIES } from '../../libs/constants';

@Injectable()
export class CountryService {
  findAll() {
    return COUNTRIES;
  }
}
