import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { RootController } from "./root.controller";

@Module({
    controllers: [HealthController, RootController],
    providers: [],
    exports: [],
})
export class HealthModule {}
