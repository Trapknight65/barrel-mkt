import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'ok',
            version: 'v2.2-STABLE-TRACE',
            timestamp: new Date().toISOString(),
            service: 'Barrel Backend',
        };
    }
}
