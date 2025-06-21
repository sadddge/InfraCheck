import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppException } from 'src/common/exceptions/app.exception';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { FollowsService } from './follows.service';

describe('FollowsService', () => {
    let service: FollowsService;
    let userRepository: jest.Mocked<Repository<User>>;
    let reportRepository: jest.Mocked<Repository<Report>>;

    const mockUser = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
    } as unknown as User;

    const mockReport = {
        id: 1,
        title: 'Test Report',
        description: 'Test Description',
        followers: [],
    } as unknown as Report;

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
        const mockReportWithFollowers = {
            ...mockReport,
            followers: [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
            ],
        };

        it('should return list of follower names', async () => {
            reportRepository.findOne.mockResolvedValue(mockReport);
            mockQueryBuilder.getOne.mockResolvedValue(mockReportWithFollowers);

            const result = await service.getReportFollowers(1);

            expect(result).toEqual({ followers: ['John', 'Jane'] });
            expect(reportRepository.createQueryBuilder).toHaveBeenCalledWith('report');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                'report.followers',
                'follower',
            );
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('report.id = :reportId', {
                reportId: 1,
            });
            expect(mockQueryBuilder.getOne).toHaveBeenCalled();
        });

        it('should return empty array when report has no followers', async () => {
            reportRepository.findOne.mockResolvedValue(mockReport);
            mockQueryBuilder.getOne.mockResolvedValue({ ...mockReport, followers: [] });

            const result = await service.getReportFollowers(1);

            expect(result).toEqual({ followers: [] });
        });

        it('should return empty array when report is null', async () => {
            reportRepository.findOne.mockResolvedValue(mockReport);
            mockQueryBuilder.getOne.mockResolvedValue(null);

            const result = await service.getReportFollowers(1);

            expect(result).toEqual({ followers: [] });
        });

        it('should throw AppException when report does not exist', async () => {
            reportRepository.findOne.mockResolvedValue(null);

            await expect(service.getReportFollowers(1)).rejects.toThrow(AppException);
        });
    });

    describe('getUserFollowedReports', () => {
        it('should return list of followed report IDs and total count', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            const mockReports = [{ id: 1 }, { id: 2 }, { id: 3 }];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([mockReports, 3]);

            const result = await service.getUserFollowedReports(1);

            expect(result).toEqual({ reports: [1, 2, 3], total: 3 });
            expect(reportRepository.createQueryBuilder).toHaveBeenCalledWith('report');
            expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
                'report.followers',
                'follower',
                'follower.id = :userId',
                { userId: 1 },
            );
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(['report.id']);
            expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
        });

        it('should return empty array when user follows no reports', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            const result = await service.getUserFollowedReports(1);

            expect(result).toEqual({ reports: [], total: 0 });
        });

        it('should throw AppException when user does not exist', async () => {
            userRepository.findOne.mockResolvedValue(null);

            await expect(service.getUserFollowedReports(1)).rejects.toThrow(AppException);
        });
    });

    describe('getFollowersIds', () => {
        const mockReportWithFollowers = {
            ...mockReport,
            followers: [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
            ],
        };

        it('should return list of follower IDs', async () => {
            reportRepository.findOne.mockResolvedValue(mockReport);
            mockQueryBuilder.getOne.mockResolvedValue(mockReportWithFollowers);

            const result = await service.getFollowersIds(1);

            expect(result).toEqual({ userIds: [1, 2] });
            expect(reportRepository.createQueryBuilder).toHaveBeenCalledWith('report');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
                'report.followers',
                'follower',
            );
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('report.id = :reportId', {
                reportId: 1,
            });
            expect(mockQueryBuilder.getOne).toHaveBeenCalled();
        });

        it('should return empty array when report has no followers', async () => {
            reportRepository.findOne.mockResolvedValue(mockReport);
            mockQueryBuilder.getOne.mockResolvedValue({ ...mockReport, followers: [] });

            const result = await service.getFollowersIds(1);

            expect(result).toEqual({ userIds: [] });
        });

        it('should return empty array when report is null', async () => {
            reportRepository.findOne.mockResolvedValue(mockReport);
            mockQueryBuilder.getOne.mockResolvedValue(null);

            const result = await service.getFollowersIds(1);

            expect(result).toEqual({ userIds: [] });
        });

        it('should throw AppException when report does not exist', async () => {
            reportRepository.findOne.mockResolvedValue(null);

            await expect(service.getFollowersIds(1)).rejects.toThrow(AppException);
        });
    });
});
