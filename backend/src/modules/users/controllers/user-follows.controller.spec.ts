import { Test, TestingModule } from '@nestjs/testing';
import {
    DEFAULT_PAGINATION_DTO,
    TEST_ERROR_MESSAGES,
    TEST_IDS,
    createEmptyPaginationResponse,
    createMockPaginationResponse,
    createMockRequest,
} from '../../../common/test-helpers';
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
            const mockRequest = createMockRequest(TEST_IDS.USER_ID);
            const expectedResponse = createMockPaginationResponse([1, 2]);

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getCurrentUserFollowedReports(
                mockRequest,
                DEFAULT_PAGINATION_DTO,
            );

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(
                TEST_IDS.USER_ID,
                DEFAULT_PAGINATION_DTO,
            );
            expect(result).toEqual(expectedResponse);
        });

        it('should propagate errors from followsService.getUserFollowedReports', async () => {
            const mockRequest = createMockRequest(999);
            const error = new Error(TEST_ERROR_MESSAGES.USER_NOT_FOUND);

            mockFollowsService.getUserFollowedReports.mockRejectedValue(error);

            await expect(
                controller.getCurrentUserFollowedReports(mockRequest, DEFAULT_PAGINATION_DTO),
            ).rejects.toThrow(TEST_ERROR_MESSAGES.USER_NOT_FOUND);
            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(
                999,
                DEFAULT_PAGINATION_DTO,
            );
        });
        it('should return empty followed reports when user follows no reports', async () => {
            const mockRequest = createMockRequest(TEST_IDS.USER_ID);
            const expectedResponse = createEmptyPaginationResponse();

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getCurrentUserFollowedReports(
                mockRequest,
                DEFAULT_PAGINATION_DTO,
            );

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(
                TEST_IDS.USER_ID,
                DEFAULT_PAGINATION_DTO,
            );
            expect(result).toEqual(expectedResponse);
            expect(result.items).toEqual([]);
            expect(result.meta.totalItems).toBe(0);
        });
        it('should handle request without user information', async () => {
            const mockRequest = { user: undefined };
            const paginationDto = { page: 1, limit: 10 };

            // This would cause a runtime error when accessing req.user.id
            await expect(
                controller.getCurrentUserFollowedReports(mockRequest, paginationDto),
            ).rejects.toThrow("Cannot read properties of undefined (reading 'id')");
        });
    });

    describe('getUserFollowedReports', () => {
        it('should call followsService.getUserFollowedReports with specified userId and return followed reports', async () => {
            const userId = 456;
            const paginationDto = { page: 1, limit: 10 };
            const expectedResponse = {
                items: [{ id: 3, title: 'Sample Report' }],
                meta: {
                    itemCount: 1,
                    totalItems: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'first-link',
                    previous: '',
                    next: '',
                    last: 'last-link',
                },
            };

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getUserFollowedReports(userId, paginationDto);

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(
                userId,
                paginationDto,
            );
            expect(result).toEqual(expectedResponse);
        });
        it('should propagate errors from followsService.getUserFollowedReports', async () => {
            const userId = 999;
            const paginationDto = { page: 1, limit: 10 };
            const error = new Error('User not found');

            mockFollowsService.getUserFollowedReports.mockRejectedValue(error);

            await expect(controller.getUserFollowedReports(userId, paginationDto)).rejects.toThrow(
                'User not found',
            );
            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(
                userId,
                paginationDto,
            );
        });
        it('should return empty followed reports when specified user follows no reports', async () => {
            const userId = 456;
            const paginationDto = { page: 1, limit: 10 };
            const expectedResponse = {
                items: [],
                meta: {
                    itemCount: 0,
                    totalItems: 0,
                    itemsPerPage: 10,
                    totalPages: 0,
                    currentPage: 1,
                },
                links: {
                    first: 'first-link',
                    previous: '',
                    next: '',
                    last: 'last-link',
                },
            };

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getUserFollowedReports(userId, paginationDto);

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(
                userId,
                paginationDto,
            );
            expect(result).toEqual(expectedResponse);
            expect(result.items).toEqual([]);
            expect(result.meta.totalItems).toBe(0);
        });
        it('should handle invalid user ID', async () => {
            const userId = -1;
            const paginationDto = { page: 1, limit: 10 };
            const error = new Error('Invalid user ID');

            mockFollowsService.getUserFollowedReports.mockRejectedValue(error);

            await expect(controller.getUserFollowedReports(userId, paginationDto)).rejects.toThrow(
                'Invalid user ID',
            );
            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(
                userId,
                paginationDto,
            );
        });
        it('should handle large datasets correctly', async () => {
            const userId = 123;
            const paginationDto = { page: 1, limit: 50 };
            const largeReportsIdsList = Array.from({ length: 50 }, (_, index) => ({
                id: index + 1,
                title: `Report ${index + 1}`,
            }));

            const expectedResponse = {
                items: largeReportsIdsList,
                meta: {
                    itemCount: 50,
                    totalItems: 50,
                    itemsPerPage: 50,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'first-link',
                    previous: '',
                    next: '',
                    last: 'last-link',
                },
            };

            mockFollowsService.getUserFollowedReports.mockResolvedValue(expectedResponse);

            const result = await controller.getUserFollowedReports(userId, paginationDto);

            expect(followsService.getUserFollowedReports).toHaveBeenCalledWith(
                userId,
                paginationDto,
            );
            expect(result).toEqual(expectedResponse);
            expect(result.items).toHaveLength(50);
            expect(result.meta.totalItems).toBe(50);
        });
    });
});
