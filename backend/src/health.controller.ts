import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
    constructor(private configService: ConfigService) { }

    @Get()
    check() {
        const key = this.configService.get<string>('CJ_API_KEY');
        return {
            status: 'ok',
            version: 'v4.0-UNDENIABLE',
            timestamp: new Date().toISOString(),
            service: 'Barrel Backend',
            config: {
                hasApiKey: !!key,
                keyLength: key ? key.length : 0,
                keyPreview: key ? `${key.substring(0, 5)}...` : 'none'
            }
        };
    }
}
