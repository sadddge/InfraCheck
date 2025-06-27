import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppException } from 'src/common/exceptions/app.exception';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { createMockReport, createMockUser, mockPaginate } from '../../../../common/test-helpers';
import { FollowsService } from './follows.service';

describe('FollowsService', () => {
    let service: FollowsService;
    let userRepository: jest.Mocked<Repository<User>>;
    let reportRepository: jest.Mocked<Repository<Report>>;

    // Use mock factories for test data
    const mockUser = createMockUser({
        id: 1,
        name: 'John',
        lastName: 'Doe',
    });

    const mockReport = createMockReport({
        id: 1,
        title: 'Test Report',
        description: 'Test Description',
        followers: [],
    });

    const mockQueryBuilder = {
        relation: jest.fn().mockReturnThis(),
        of: jest.fn().mockReturnThis(),
        add: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
        createQueryBuilder: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getManyAndCount: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FollowsService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                        createQueryBuilder: jest.fn(() => mockQueryBuilder),
                    },
                },
                {
                    provide: getRepositoryToken(Report),
                    useValue: {
                        findOne: jest.fn(),
                        createQueryBuilder: jest.fn(() => mockQueryBuilder),
                    },
                },
            ],
        }).compile();
        service = module.get<FollowsService>(FollowsService);
        userRepository = module.get(getRepositoryToken(User));
        reportRepository = module.get(getRepositoryToken(Report));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('followReport', () => {
        beforeEach(() => {
            userRepository.findOne.mockResolvedValue(mockUser);
            reportRepository.findOne.mockResolvedValue(mockReport);
        });

        it('should successfully follow a report', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(0); // Not following
            mockQueryBuilder.add.mockResolvedValue(undefined);

            const result = await service.followReport(1, 1);

            expect(result).toEqual({ message: 'Report followed successfully' });
            expect(reportRepository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.relation).toHaveBeenCalledWith(Report, 'followers');
            expect(mockQueryBuilder.of).toHaveBeenCalledWith(1);
            expect(mockQueryBuilder.add).toHaveBeenCalledWith(1);
        });

        it('should throw AppException when user is already following', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(1); // Already following

            await expect(service.followReport(1, 1)).rejects.toThrow(AppException);
        });

        it('should throw AppException when user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.followReport(1, 1)).rejects.toThrow(AppException);
        });

        it('should throw AppException when report does not exist', async () => {
            reportRepository.findOne.mockResolvedValue(null);

            await expect(service.followReport(1, 1)).rejects.toThrow(AppException);
        });

        it('should throw AppException when userId is invalid', async () => {
            await expect(service.followReport(0, 1)).rejects.toThrow(AppException);
        });

        it('should throw AppException when reportId is invalid', async () => {
            await expect(service.followReport(1, 0)).rejects.toThrow(AppException);
        });
    });

    describe('unfollowReport', () => {
        beforeEach(() => {
            userRepository.findOne.mockResolvedValue(mockUser);
            reportRepository.findOne.mockResolvedValue(mockReport);
        });

        it('should successfully unfollow a report', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(1); // Is following
            mockQueryBuilder.remove.mockResolvedValue(undefined);

            const result = await service.unfollowReport(1, 1);

            expect(result).toEqual({ message: 'Report unfollowed successfully' });
            expect(reportRepository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.relation).toHaveBeenCalledWith(Report, 'followers');
            expect(mockQueryBuilder.of).toHaveBeenCalledWith(1);
            expect(mockQueryBuilder.remove).toHaveBeenCalledWith(1);
        });

        it('should throw AppException when user is not following', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(0); // Not following

            await expect(service.unfollowReport(1, 1)).rejects.toThrow(AppException);
        });

        it('should throw AppException when user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.unfollowReport(1, 1)).rejects.toThrow(AppException);
        });

        it('should throw AppException when report does not exist', async () => {
            reportRepository.findOne.mockResolvedValue(null);

            await expect(service.unfollowReport(1, 1)).rejects.toThrow(AppException);
        });
    });

    describe('isFollowingReport', () => {
        it('should return true when user is following the report', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(1);

            const result = await service.isFollowingReport(1, 1);

            expect(result).toEqual({ isFollowing: true });
            expect(reportRepository.createQueryBuilder).toHaveBeenCalledWith('report');
            expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
                'report.followers',
                'follower',
                'follower.id = :userId',
                { userId: 1 },
            );
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('report.id = :reportId', {
                reportId: 1,
            });
            expect(mockQueryBuilder.getCount).toHaveBeenCalled();
        });

        it('should return false when user is not following the report', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(0);

            const result = await service.isFollowingReport(1, 1);

            expect(result).toEqual({ isFollowing: false });
        });

        it('should throw AppException when userId is falsy', async () => {
            await expect(service.isFollowingReport(0, 1)).rejects.toThrow(AppException);
        });

        it('should throw AppException when reportId is falsy', async () => {
            await expect(service.isFollowingReport(1, 0)).rejects.toThrow(AppException);
        });
    });
    describe('getReportFollowers', () => {
        it('should return list of followers with pagination', async () => {
            const reportId = 1;
            const options = { page: 1, limit: 10 };
            const mockUsers = [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
            ];

            reportRepository.findOne.mockResolvedValue(mockReport);

            const mockPaginatedResponse = {
                items: mockUsers,
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

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            const result = await service.getReportFollowers(reportId, options);

            expect(mockPaginate).toHaveBeenCalledWith(expect.any(Object), options);
            expect(result.items).toEqual([
                { userId: 1, username: 'John' },
                { userId: 2, username: 'Jane' },
            ]);
        });

        it('should return empty array when report has no followers', async () => {
            const reportId = 1;
            const options = { page: 1, limit: 10 };

            reportRepository.findOne.mockResolvedValue(mockReport);

            const mockPaginatedResponse = {
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

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            const result = await service.getReportFollowers(reportId, options);

            expect(result.items).toEqual([]);
        });

        it('should throw AppException when report does not exist', async () => {
            const reportId = 1;
            const options = { page: 1, limit: 10 };

            reportRepository.findOne.mockResolvedValue(null);

            await expect(service.getReportFollowers(reportId, options)).rejects.toThrow(
                AppException,
            );
        });
    });

    describe('getUserFollowedReports', () => {
        it('should return list of followed report IDs and total count', async () => {
            const userId = 1;
            const options = { page: 1, limit: 10 };
            const mockReports = [
                { id: 1, title: 'Report 1' },
                { id: 2, title: 'Report 2' },
                { id: 3, title: 'Report 3' },
            ];

            userRepository.findOne.mockResolvedValue(mockUser);

            const mockPaginatedResponse = {
                items: mockReports,
                meta: {
                    totalItems: 3,
                    itemCount: 3,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'http://localhost:3000/followed-reports?page=1',
                    previous: '',
                    next: '',
                    last: 'http://localhost:3000/followed-reports?page=1',
                },
            };

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            const result = await service.getUserFollowedReports(userId, options);

            expect(mockPaginate).toHaveBeenCalledWith(expect.any(Object), options);
            expect(result.items).toEqual([
                { reportId: 1, reportTitle: 'Report 1' },
                { reportId: 2, reportTitle: 'Report 2' },
                { reportId: 3, reportTitle: 'Report 3' },
            ]);
        });
        it('should return empty array when user follows no reports', async () => {
            const userId = 1;
            const options = { page: 1, limit: 10 };

            userRepository.findOne.mockResolvedValue(mockUser);

            const mockPaginatedResponse = {
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

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            const result = await service.getUserFollowedReports(userId, options);

            expect(result.items).toEqual([]);
        });
        it('should throw AppException when user does not exist', async () => {
            const userId = 1;
            const options = { page: 1, limit: 10 };

            userRepository.findOne.mockResolvedValue(null);

            await expect(service.getUserFollowedReports(userId, options)).rejects.toThrow(
                AppException,
            );
        });
    });

    describe('getReportFollowerIds', () => {
        it('should return array of follower user IDs', async () => {
            const reportId = 1;
            const mockUsers = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ];

            reportRepository.findOne.mockResolvedValue(mockReport);
            mockQueryBuilder.getMany.mockResolvedValue(mockUsers);

            const result = await service.getReportFollowerIds(reportId);

            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
            expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
                'user.reportsFollowed',
                'report',
                'report.id = :reportId',
                { reportId },
            );
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(['user.id']);
            expect(mockQueryBuilder.getMany).toHaveBeenCalled();
            expect(result).toEqual([1, 2, 3]);
        });

        it('should return empty array when report has no followers', async () => {
            const reportId = 1;

            reportRepository.findOne.mockResolvedValue(mockReport);
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await service.getReportFollowerIds(reportId);

            expect(result).toEqual([]);
        });

        it('should throw AppException when report does not exist', async () => {
            const reportId = 999;

            reportRepository.findOne.mockResolvedValue(null);

            await expect(service.getReportFollowerIds(reportId)).rejects.toThrow(AppException);
        });
    });
});
