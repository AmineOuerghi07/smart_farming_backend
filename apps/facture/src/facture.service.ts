import { Injectable } from '@nestjs/common';

@Injectable()
export class FactureService {
  getHello(): string {
    return 'Hello World!';
  }
}
