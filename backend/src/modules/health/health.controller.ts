import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";

@Controller()
export class HealthController {
    @Get()
    @HttpCode(HttpStatus.OK)
    checkHealth() {
        return true;
    }
}