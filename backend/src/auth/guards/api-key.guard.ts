import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { KeyService } from '../../keys/key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private keyService: KeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('No API key provided');
    }

    const validKey = await this.keyService.validateKey(apiKey);
    if (!validKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.apiKey = validKey;
    return true;
  }
}
