import { Injectable } from '@nestjs/common';
import { COUNTRIES } from '../../libs/countries';

@Injectable()
export class CountryService {
  findAll() {
    return COUNTRIES;
  }
}
