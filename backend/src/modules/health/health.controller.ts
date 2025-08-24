import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";

@Controller()
export class HealthController {
    @Get()
    @Public()
    @HttpCode(HttpStatus.OK)
    checkHealth() {
        return true;
    }
}