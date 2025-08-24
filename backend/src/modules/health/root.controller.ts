import { Controller, Get, Head } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";

@Controller()
export class RootController {
    @Get()
    @Public()
    getRoot() {
        return {
            message: "Welcome to the InfraCheck API",
            version: "1.0.0",
            documentation: "/api/docs",
        };
    }
    @Head()
    @Public()
    headRoot() {
        return;
    }
}