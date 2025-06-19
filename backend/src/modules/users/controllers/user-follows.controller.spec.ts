import { Test, TestingModule } from '@nestjs/testing';
import {
    FOLLOWS_SERVICE,
    IFollowsService,
} from '../../reports/follows/interfaces/follows-service.interface';
import { UserFollowsController } from './user-follows.controller';

describe('UserFollowsController', () => {
    let controller: UserFollowsController;
    let followsService: jest.Mocked<IFollowsService>;

    const mockFollowsService = {
        followReport: jest.fn(),
        unfollowReport: jest.fn(),
        isFollowingReport: jest.fn(),
        getReportFollowers: jest.fn(),
        getUserFollowedReports: jest.fn(),
        getFollowersIds: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserFollowsController],
            providers: [{ provide: FOLLOWS_SERVICE, useValue: mockFollowsService }],
        }).compile();

        controller = module.get<UserFollowsController>(UserFollowsController);
        followsService = module.get(FOLLOWS_SERVICE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getCurrentUserFollowedReports', () => {
        it('should call followsService.getUserFollowedReports with current user ID and return followed reports', async () => {
            const mockRequest = { user: { id: 123 } };
            const expectedResponse = {
                reports: [1, 2],
                total: 2,
            };

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getCurrentUserFollowedReports(mockRequest);

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(123);
            expect(result).toEqual(expectedResponse);
        });

        it('should propagate errors from followsService.getUserFollowedReports', async () => {
            const mockRequest = { user: { id: 999 } };
            const error = new Error('User not found');

            mockFollowsService.getUserFollowedReports.mockRejectedValue(error);

            await expect(controller.getCurrentUserFollowedReports(mockRequest)).rejects.toThrow(
                'User not found',
            );
            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(999);
        });

        it('should return empty followed reports when user follows no reports', async () => {
            const mockRequest = { user: { id: 123 } };
            const expectedResponse = {
                reports: [],
                total: 0,
            };

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getCurrentUserFollowedReports(mockRequest);

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(123);
            expect(result).toEqual(expectedResponse);
            expect(result.reports).toEqual([]);
            expect(result.total).toBe(0);
        });

        it('should handle request without user information', async () => {
            const mockRequest = { user: undefined };

            // This would cause a runtime error when accessing req.user.id
            await expect(controller.getCurrentUserFollowedReports(mockRequest)).rejects.toThrow(
                "Cannot read properties of undefined (reading 'id')",
            );
        });
    });

    describe('getUserFollowedReports', () => {
        it('should call followsService.getUserFollowedReports with specified userId and return followed reports', async () => {
            const userId = 456;
            const expectedResponse = {
                reports: [3],
                total: 1,
            };

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getUserFollowedReports(userId);

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(userId);
            expect(result).toEqual(expectedResponse);
        });

        it('should propagate errors from followsService.getUserFollowedReports', async () => {
            const userId = 999;
            const error = new Error('User not found');

            mockFollowsService.getUserFollowedReports.mockRejectedValue(error);

            await expect(controller.getUserFollowedReports(userId)).rejects.toThrow(
                'User not found',
            );
            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(userId);
        });

        it('should return empty followed reports when specified user follows no reports', async () => {
            const userId = 456;
            const expectedResponse = {
                reports: [],
                total: 0,
            };

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getUserFollowedReports(userId);

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(userId);
            expect(result).toEqual(expectedResponse);
            expect(result.reports).toEqual([]);
            expect(result.total).toBe(0);
        });

        it('should handle invalid user ID', async () => {
            const userId = -1;
            const error = new Error('Invalid user ID');

            mockFollowsService.getUserFollowedReports.mockRejectedValue(error);

            await expect(controller.getUserFollowedReports(userId)).rejects.toThrow(
                'Invalid user ID',
            );
            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(userId);
        });

        it('should handle large datasets correctly', async () => {
            const userId = 123;
            const largeReportsIdsList = Array.from({ length: 50 }, (_, index) => index + 1);

            const expectedResponse = {
                reports: largeReportsIdsList,
                total: 50,
            };

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getUserFollowedReports(userId);

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(userId);
            expect(result).toEqual(expectedResponse);
            expect(result.reports).toHaveLength(50);
            expect(result.total).toBe(50);
        });
    });
});
