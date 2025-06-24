import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { VoteType } from 'src/common/enums/vote-type.enums';
import * as exceptionHelper from 'src/common/helpers/exception.helper';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { Vote } from 'src/database/entities/vote.entity';
import { CreateVoteDto } from '../dto/create-vote.dto';
import { VotesService } from './votes.service';

// Mock the exception helper functions
jest.mock('src/common/helpers/exception.helper', () => ({
    duplicateVote: jest.fn().mockImplementation(() => {
        throw new Error('Duplicate vote');
    }),
    reportNotFound: jest.fn().mockImplementation(() => {
        throw new Error('Report not found');
    }),
    userNotFound: jest.fn().mockImplementation(() => {
        throw new Error('User not found');
    }),
    voteNotFound: jest.fn().mockImplementation(() => {
        throw new Error('Vote not found');
    }),
}));

describe('VotesService', () => {
    let service: VotesService;

    const mockUser: Partial<User> = {
        id: 1,
        phoneNumber: '+56912345678',
        name: 'John',
        lastName: 'Doe',
        password: 'hashedPassword',
        status: UserStatus.ACTIVE,
        role: Role.NEIGHBOR,
        createdAt: new Date(),
    };

    const mockReport: Partial<Report> = {
        id: 1,
        title: 'Test Report',
        description: 'Test Description',
        latitude: -33.4489,
        longitude: -70.6693,
        state: ReportState.PENDING,
        category: ReportCategory.INFRASTRUCTURE,
        createdAt: new Date(),
    };

    const mockVote: Partial<Vote> = {
        id: 1,
        user: mockUser as User,
        report: mockReport as Report,
        type: VoteType.UPVOTE,
        createdAt: new Date(),
    };

    const mockVoteRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        find: jest.fn(),
        count: jest.fn(),
    };

    const mockReportRepository = {
        findOne: jest.fn(),
    };

    const mockUserRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotesService,
                {
                    provide: getRepositoryToken(Vote),
                    useValue: mockVoteRepository,
                },
                {
                    provide: getRepositoryToken(Report),
                    useValue: mockReportRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<VotesService>(VotesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('vote', () => {
        const createVoteDto: CreateVoteDto = { type: VoteType.UPVOTE };

        beforeEach(() => {
            mockReportRepository.findOne.mockResolvedValue(mockReport);
            mockUserRepository.findOne.mockResolvedValue(mockUser);
        });

        it('should create a new vote when user has not voted before', async () => {
            mockVoteRepository.findOne.mockResolvedValue(null);
            mockVoteRepository.create.mockReturnValue(mockVote);
            mockVoteRepository.save.mockResolvedValue(mockVote);

            const result = await service.vote(1, 1, createVoteDto);

            expect(mockVoteRepository.findOne).toHaveBeenCalledWith({
                where: {
                    user: { id: expect.any(Object) },
                    report: { id: expect.any(Object) },
                },
                relations: ['user', 'report'],
            });
            expect(mockVoteRepository.create).toHaveBeenCalledWith({
                user: mockUser,
                report: mockReport,
                type: VoteType.UPVOTE,
            });
            expect(mockVoteRepository.save).toHaveBeenCalledWith(mockVote);
            expect(result).toEqual({
                id: 1,
                type: VoteType.UPVOTE,
                userId: 1,
                reportId: 1,
                createdAt: expect.any(Date),
            });
        });

        it('should update existing vote when user votes with different type', async () => {
            const existingDownvote = { ...mockVote, type: VoteType.DOWNVOTE };
            mockVoteRepository.findOne.mockResolvedValue(existingDownvote);

            const updatedVote = { ...existingDownvote, type: VoteType.UPVOTE };
            mockVoteRepository.save.mockResolvedValue(updatedVote);

            const result = await service.vote(1, 1, createVoteDto);

            expect(existingDownvote.type).toBe(VoteType.UPVOTE);
            expect(mockVoteRepository.save).toHaveBeenCalledWith(existingDownvote);
            expect(result.type).toBe(VoteType.UPVOTE);
        });

        it('should throw error when user tries to cast same vote type', async () => {
            const existingUpvote = { ...mockVote, type: VoteType.UPVOTE };
            mockVoteRepository.findOne.mockResolvedValue(existingUpvote);

            await expect(service.vote(1, 1, createVoteDto)).rejects.toThrow('Duplicate vote');
            expect(exceptionHelper.duplicateVote).toHaveBeenCalledWith({
                userId: '1',
                reportId: '1',
                voteType: VoteType.UPVOTE,
            });
        });

        it('should throw error when report does not exist', async () => {
            mockReportRepository.findOne.mockResolvedValue(null);

            await expect(service.vote(1, 1, createVoteDto)).rejects.toThrow('Report not found');
            expect(exceptionHelper.reportNotFound).toHaveBeenCalledWith({ reportId: '1' });
        });

        it('should throw error when user does not exist', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.vote(1, 1, createVoteDto)).rejects.toThrow('User not found');
            expect(exceptionHelper.userNotFound).toHaveBeenCalledWith({ userId: '1' });
        });
    });

    describe('removeVote', () => {
        it('should remove existing vote and return true', async () => {
            mockVoteRepository.findOne.mockResolvedValue(mockVote);
            mockVoteRepository.remove.mockResolvedValue(mockVote);

            const result = await service.removeVote(1, 1);

            expect(mockVoteRepository.findOne).toHaveBeenCalledWith({
                where: {
                    user: { id: 1 },
                    report: { id: 1 },
                },
            });
            expect(mockVoteRepository.remove).toHaveBeenCalledWith(mockVote);
            expect(result).toBe(true);
        });

        it('should return false when vote does not exist', async () => {
            mockVoteRepository.findOne.mockResolvedValue(null);

            const result = await service.removeVote(1, 1);

            expect(mockVoteRepository.findOne).toHaveBeenCalledWith({
                where: {
                    user: { id: 1 },
                    report: { id: 1 },
                },
            });
            expect(mockVoteRepository.remove).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('getVoteStats', () => {
        it('should return vote statistics for a report', async () => {
            mockReportRepository.findOne.mockResolvedValue(mockReport);
            mockVoteRepository.count
                .mockResolvedValueOnce(2) // upvotes
                .mockResolvedValueOnce(1); // downvotes

            const result = await service.getVoteStats(1);

            expect(mockReportRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockVoteRepository.count).toHaveBeenCalledWith({
                where: { report: { id: 1 }, type: VoteType.UPVOTE },
            });
            expect(mockVoteRepository.count).toHaveBeenCalledWith({
                where: { report: { id: 1 }, type: VoteType.DOWNVOTE },
            });
            expect(result).toEqual({
                upvotes: 2,
                downvotes: 1,
                score: 1,
                totalVotes: 3,
            });
        });

        it('should throw error when report does not exist', async () => {
            mockReportRepository.findOne.mockResolvedValue(null);

            await expect(service.getVoteStats(1)).rejects.toThrow('Report with ID 1 not found');
            expect(mockReportRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should return zero statistics when no votes exist', async () => {
            mockReportRepository.findOne.mockResolvedValue(mockReport);
            mockVoteRepository.count
                .mockResolvedValueOnce(0) // upvotes
                .mockResolvedValueOnce(0); // downvotes

            const result = await service.getVoteStats(1);

            expect(result).toEqual({
                upvotes: 0,
                downvotes: 0,
                score: 0,
                totalVotes: 0,
            });
        });
    });

    describe('getUserVote', () => {
        beforeEach(() => {
            mockReportRepository.findOne.mockResolvedValue(mockReport);
            mockUserRepository.findOne.mockResolvedValue(mockUser);
        });

        it('should return user vote when it exists', async () => {
            mockVoteRepository.findOne.mockResolvedValue(mockVote);

            const result = await service.getUserVote(1, 1);

            expect(mockVoteRepository.findOne).toHaveBeenCalledWith({
                where: {
                    user: { id: expect.any(Object) },
                    report: { id: expect.any(Object) },
                },
                relations: ['user', 'report'],
            });
            expect(result).toEqual({
                id: 1,
                type: VoteType.UPVOTE,
                userId: 1,
                reportId: 1,
                createdAt: expect.any(Date),
            });
        });

        it('should throw error when vote does not exist', async () => {
            mockVoteRepository.findOne.mockResolvedValue(null);

            await expect(service.getUserVote(1, 1)).rejects.toThrow('Vote not found');
            expect(exceptionHelper.voteNotFound).toHaveBeenCalledWith({
                userId: '1',
                reportId: '1',
            });
        });

        it('should throw error when report does not exist', async () => {
            mockReportRepository.findOne.mockResolvedValue(null);

            await expect(service.getUserVote(1, 1)).rejects.toThrow('Report not found');
            expect(exceptionHelper.reportNotFound).toHaveBeenCalledWith({ reportId: '1' });
        });

        it('should throw error when user does not exist', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.getUserVote(1, 1)).rejects.toThrow('User not found');
            expect(exceptionHelper.userNotFound).toHaveBeenCalledWith({ userId: '1' });
        });
    });
});
