import { Controller, Get, Head } from "@nestjs/common";

@Controller()
export class RootController {
    @Get()
    getRoot() {
        return {
            message: "Welcome to the InfraCheck API",
            version: "1.0.0",
            documentation: "/api/docs",
        };
    }
    @Head()
    headRoot() {
        return;
    }
}