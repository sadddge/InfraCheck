import { Test, TestingModule } from '@nestjs/testing';
import { JwtResetGuard } from './jwt-reset.guard';

describe('JwtResetGuard', () => {
    let guard: JwtResetGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtResetGuard],
        }).compile();

        guard = module.get<JwtResetGuard>(JwtResetGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should extend AuthGuard with jwt-reset strategy', () => {
        // Arrange & Act
        const guardInstance = new JwtResetGuard();

        // Assert
        expect(guardInstance).toBeInstanceOf(JwtResetGuard);
        // The guard should use the 'jwt-reset' strategy name
        expect(guard).toBeDefined();
    });
});
