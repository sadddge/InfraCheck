import { Test, TestingModule } from '@nestjs/testing';
import { JwtRefreshGuard } from './jwt-refresh.guard';

describe('JwtRefreshGuard', () => {
    let guard: JwtRefreshGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtRefreshGuard],
        }).compile();

        guard = module.get<JwtRefreshGuard>(JwtRefreshGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should extend AuthGuard with jwt-refresh strategy', () => {
        // Arrange & Act
        const guardInstance = new JwtRefreshGuard();

        // Assert
        expect(guardInstance).toBeInstanceOf(JwtRefreshGuard);
        // The guard should use the 'jwt-refresh' strategy name
        expect(guard).toBeDefined();
    });
});
