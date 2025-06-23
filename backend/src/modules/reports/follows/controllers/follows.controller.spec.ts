import { Test, TestingModule } from '@nestjs/testing';
import { FOLLOWS_SERVICE, IFollowsService } from '../interfaces/follows-service.interface';
import { FollowsController } from './follows.controller';

describe('FollowsController', () => {
    let controller: FollowsController;
    let followsService: jest.Mocked<IFollowsService>;
    const mockFollowsService = {
        followReport: jest.fn(),
        unfollowReport: jest.fn(),
        isFollowingReport: jest.fn(),
        getReportFollowers: jest.fn(),
        getUserFollowedReports: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FollowsController],
            providers: [{ provide: FOLLOWS_SERVICE, useValue: mockFollowsService }],
        }).compile();

        controller = module.get<FollowsController>(FollowsController);
        followsService = module.get(FOLLOWS_SERVICE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('followReport', () => {
        it('should call followsService.followReport with correct parameters and return success response', async () => {
            const reportId = 123;
            const mockRequest = { user: { id: 1 } };
            const expectedResponse = {
                success: true,
                message: 'Report followed successfully',
            };

            mockFollowsService.followReport.mockResolvedValue(expectedResponse);

            const result = await controller.followReport(reportId, mockRequest);

            expect(followsService.followReport).toHaveBeenCalledWith(mockRequest.user.id, reportId);
            expect(result).toEqual(expectedResponse);
        });

        it('should propagate errors from followsService.followReport', async () => {
            const reportId = 999;
            const mockRequest = { user: { id: 1 } };
            const error = new Error('Report not found');

            mockFollowsService.followReport.mockRejectedValue(error);

            await expect(controller.followReport(reportId, mockRequest)).rejects.toThrow(
                'Report not found',
            );
            expect(followsService.followReport).toHaveBeenCalledWith(mockRequest.user.id, reportId);
        });

        it('should handle already following error', async () => {
            const reportId = 123;
            const mockRequest = { user: { id: 1 } };
            const error = new Error('User is already following this report');

            mockFollowsService.followReport.mockRejectedValue(error);

            await expect(controller.followReport(reportId, mockRequest)).rejects.toThrow(
                'User is already following this report',
            );
            expect(followsService.followReport).toHaveBeenCalledWith(mockRequest.user.id, reportId);
        });
    });

    describe('unfollowReport', () => {
        it('should call followsService.unfollowReport with correct parameters and return success response', async () => {
            const reportId = 123;
            const mockRequest = { user: { id: 1 } };
            const expectedResponse = {
                success: true,
                message: 'Report unfollowed successfully',
            };

            mockFollowsService.unfollowReport.mockResolvedValue(expectedResponse);

            const result = await controller.unfollowReport(reportId, mockRequest);

            expect(followsService.unfollowReport).toHaveBeenCalledWith(
                mockRequest.user.id,
                reportId,
            );
            expect(result).toEqual(expectedResponse);
        });

        it('should propagate errors from followsService.unfollowReport', async () => {
            const reportId = 999;
            const mockRequest = { user: { id: 1 } };
            const error = new Error('Report not found');

            mockFollowsService.unfollowReport.mockRejectedValue(error);

            await expect(controller.unfollowReport(reportId, mockRequest)).rejects.toThrow(
                'Report not found',
            );
            expect(followsService.unfollowReport).toHaveBeenCalledWith(
                mockRequest.user.id,
                reportId,
            );
        });

        it('should handle not following error', async () => {
            const reportId = 123;
            const mockRequest = { user: { id: 1 } };
            const error = new Error('User is not following this report');

            mockFollowsService.unfollowReport.mockRejectedValue(error);

            await expect(controller.unfollowReport(reportId, mockRequest)).rejects.toThrow(
                'User is not following this report',
            );
            expect(followsService.unfollowReport).toHaveBeenCalledWith(
                mockRequest.user.id,
                reportId,
            );
        });
    });

    describe('getReportFollowers', () => {
        it('should call followsService.getReportFollowers with correct reportId and return followers', async () => {
            const reportId = 123;
            const paginationDto = { page: 1, limit: 10 };
            const expectedResponse = {
                items: [
                    { userId: 1, username: 'John' },
                    { userId: 2, username: 'Jane' },
                ],
                meta: {
                    totalItems: 2,
                    itemCount: 2,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'http://localhost:3000/followers?page=1',
                    previous: '',
                    next: '',
                    last: 'http://localhost:3000/followers?page=1',
                },
            };

            mockFollowsService.getReportFollowers.mockResolvedValue(expectedResponse);

            const result = await controller.getReportFollowers(reportId, paginationDto);

            expect(followsService.getReportFollowers).toHaveBeenCalledWith(reportId, paginationDto);
            expect(result).toEqual(expectedResponse);
        });
        it('should propagate errors from followsService.getReportFollowers', async () => {
            const reportId = 999;
            const paginationDto = { page: 1, limit: 10 };
            const error = new Error('Report not found');

            mockFollowsService.getReportFollowers.mockRejectedValue(error);

            await expect(controller.getReportFollowers(reportId, paginationDto)).rejects.toThrow(
                'Report not found',
            );
            expect(followsService.getReportFollowers).toHaveBeenCalledWith(reportId, paginationDto);
        });
        it('should return empty followers list when report has no followers', async () => {
            const reportId = 123;
            const paginationDto = { page: 1, limit: 10 };
            const expectedResponse = {
                items: [],
                meta: {
                    totalItems: 0,
                    itemCount: 0,
                    itemsPerPage: 10,
                    totalPages: 0,
                    currentPage: 1,
                },
                links: {
                    first: '',
                    previous: '',
                    next: '',
                    last: '',
                },
            };

            mockFollowsService.getReportFollowers.mockResolvedValue(expectedResponse);

            const result = await controller.getReportFollowers(reportId, paginationDto);

            expect(followsService.getReportFollowers).toHaveBeenCalledWith(reportId, paginationDto);
            expect(result).toEqual(expectedResponse);
            expect(result.items).toEqual([]);
        });
    });

    describe('getFollowStatus', () => {
        it('should call followsService.isFollowingReport with correct parameters and return follow status', async () => {
            const reportId = 123;
            const mockRequest = { user: { id: 1 } };
            const expectedResponse = {
                isFollowing: true,
                reportId: 123,
                userId: 1,
            };

            mockFollowsService.isFollowingReport.mockResolvedValue(expectedResponse);

            const result = await controller.getFollowStatus(reportId, mockRequest);

            expect(followsService.isFollowingReport).toHaveBeenCalledWith(
                mockRequest.user.id,
                reportId,
            );
            expect(result).toEqual(expectedResponse);
        });

        it('should return false when user is not following the report', async () => {
            const reportId = 123;
            const mockRequest = { user: { id: 1 } };
            const expectedResponse = {
                isFollowing: false,
                reportId: 123,
                userId: 1,
            };

            mockFollowsService.isFollowingReport.mockResolvedValue(expectedResponse);

            const result = await controller.getFollowStatus(reportId, mockRequest);

            expect(followsService.isFollowingReport).toHaveBeenCalledWith(
                mockRequest.user.id,
                reportId,
            );
            expect(result).toEqual(expectedResponse);
            expect(result.isFollowing).toBe(false);
        });

        it('should propagate errors from followsService.isFollowingReport', async () => {
            const reportId = 999;
            const mockRequest = { user: { id: 1 } };
            const error = new Error('Report not found');

            mockFollowsService.isFollowingReport.mockRejectedValue(error);

            await expect(controller.getFollowStatus(reportId, mockRequest)).rejects.toThrow(
                'Report not found',
            );
            expect(followsService.isFollowingReport).toHaveBeenCalledWith(
                mockRequest.user.id,
                reportId,
            );
        });
    });
});
