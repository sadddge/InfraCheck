import { Test, TestingModule } from '@nestjs/testing';
import { VoteType } from 'src/common/enums/vote-type.enums';
import { CreateVoteDto } from '../dto/create-vote.dto';
import { VoteStatsDto } from '../dto/vote-stats.dto';
import { VoteDto } from '../dto/vote.dto';
import { IVotesService, VOTES_SERVICE } from '../interfaces/votes-service.interface';
import { VotesController } from './votes.controller';

describe('VotesController', () => {
    let controller: VotesController;
    let votesService: jest.Mocked<IVotesService>;

    const mockVotesService = {
        vote: jest.fn(),
        removeVote: jest.fn(),
        getVoteStats: jest.fn(),
        getUserVote: jest.fn(),
    };

    const mockRequest = {
        user: {
            id: 1,
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VotesController],
            providers: [
                {
                    provide: VOTES_SERVICE,
                    useValue: mockVotesService,
                },
            ],
        }).compile();

        controller = module.get<VotesController>(VotesController);
        votesService = module.get(VOTES_SERVICE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('vote', () => {
        const createVoteDto: CreateVoteDto = {
            type: VoteType.UPVOTE,
        };

        const expectedVoteDto: VoteDto = {
            id: 1,
            type: VoteType.UPVOTE,
            userId: 1,
            reportId: 1,
            createdAt: new Date(),
        };

        it('should create a vote successfully', async () => {
            mockVotesService.vote.mockResolvedValue(expectedVoteDto);

            const result = await controller.vote(1, createVoteDto, mockRequest);

            expect(votesService.vote).toHaveBeenCalledWith(1, 1, createVoteDto);
            expect(result).toEqual(expectedVoteDto);
        });

        it('should update existing vote with different type', async () => {
            const updatedVoteDto = { ...expectedVoteDto, type: VoteType.DOWNVOTE };
            const downvoteDto: CreateVoteDto = { type: VoteType.DOWNVOTE };

            mockVotesService.vote.mockResolvedValue(updatedVoteDto);

            const result = await controller.vote(1, downvoteDto, mockRequest);

            expect(votesService.vote).toHaveBeenCalledWith(1, 1, downvoteDto);
            expect(result).toEqual(updatedVoteDto);
        });

        it('should propagate error when duplicate vote is attempted', async () => {
            const error = new Error('Duplicate vote');
            mockVotesService.vote.mockRejectedValue(error);

            await expect(controller.vote(1, createVoteDto, mockRequest)).rejects.toThrow(
                'Duplicate vote',
            );
            expect(votesService.vote).toHaveBeenCalledWith(1, 1, createVoteDto);
        });

        it('should propagate error when report is not found', async () => {
            const error = new Error('Report not found');
            mockVotesService.vote.mockRejectedValue(error);

            await expect(controller.vote(999, createVoteDto, mockRequest)).rejects.toThrow(
                'Report not found',
            );
            expect(votesService.vote).toHaveBeenCalledWith(1, 999, createVoteDto);
        });
    });

    describe('removeVote', () => {
        it('should remove vote successfully', async () => {
            mockVotesService.removeVote.mockResolvedValue(true);

            const result = await controller.removeVote(1, mockRequest);

            expect(votesService.removeVote).toHaveBeenCalledWith(1, 1);
            expect(result).toBeUndefined(); // void return
        });

        it('should handle case when vote does not exist', async () => {
            mockVotesService.removeVote.mockResolvedValue(false);

            const result = await controller.removeVote(1, mockRequest);

            expect(votesService.removeVote).toHaveBeenCalledWith(1, 1);
            expect(result).toBeUndefined(); // void return
        });

        it('should propagate errors from service', async () => {
            const error = new Error('Database error');
            mockVotesService.removeVote.mockRejectedValue(error);

            await expect(controller.removeVote(1, mockRequest)).rejects.toThrow('Database error');
            expect(votesService.removeVote).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('getVoteStats', () => {
        const expectedStats: VoteStatsDto = {
            upvotes: 10,
            downvotes: 3,
            score: 7,
            totalVotes: 13,
        };

        it('should return vote statistics successfully', async () => {
            mockVotesService.getVoteStats.mockResolvedValue(expectedStats);

            const result = await controller.getVoteStats(1);

            expect(votesService.getVoteStats).toHaveBeenCalledWith(1);
            expect(result).toEqual(expectedStats);
        });

        it('should return zero statistics for report with no votes', async () => {
            const zeroStats: VoteStatsDto = {
                upvotes: 0,
                downvotes: 0,
                score: 0,
                totalVotes: 0,
            };
            mockVotesService.getVoteStats.mockResolvedValue(zeroStats);

            const result = await controller.getVoteStats(1);

            expect(votesService.getVoteStats).toHaveBeenCalledWith(1);
            expect(result).toEqual(zeroStats);
        });

        it('should propagate error when report is not found', async () => {
            const error = new Error('Report not found');
            mockVotesService.getVoteStats.mockRejectedValue(error);

            await expect(controller.getVoteStats(999)).rejects.toThrow('Report not found');
            expect(votesService.getVoteStats).toHaveBeenCalledWith(999);
        });
    });

    describe('getUserVote', () => {
        const expectedVoteDto: VoteDto = {
            id: 1,
            type: VoteType.UPVOTE,
            userId: 1,
            reportId: 1,
            createdAt: new Date(),
        };

        it('should return user vote successfully', async () => {
            mockVotesService.getUserVote.mockResolvedValue(expectedVoteDto);

            const result = await controller.getUserVote(1, mockRequest);

            expect(votesService.getUserVote).toHaveBeenCalledWith(1, 1);
            expect(result).toEqual(expectedVoteDto);
        });

        it('should handle different vote types', async () => {
            const downvoteDto = { ...expectedVoteDto, type: VoteType.DOWNVOTE };
            mockVotesService.getUserVote.mockResolvedValue(downvoteDto);

            const result = await controller.getUserVote(1, mockRequest);

            expect(votesService.getUserVote).toHaveBeenCalledWith(1, 1);
            expect(result).toEqual(downvoteDto);
        });

        it('should propagate error when vote is not found', async () => {
            const error = new Error('Vote not found');
            mockVotesService.getUserVote.mockRejectedValue(error);

            await expect(controller.getUserVote(1, mockRequest)).rejects.toThrow('Vote not found');
            expect(votesService.getUserVote).toHaveBeenCalledWith(1, 1);
        });

        it('should propagate error when report is not found', async () => {
            const error = new Error('Report not found');
            mockVotesService.getUserVote.mockRejectedValue(error);

            await expect(controller.getUserVote(999, mockRequest)).rejects.toThrow(
                'Report not found',
            );
            expect(votesService.getUserVote).toHaveBeenCalledWith(1, 999);
        });

        it('should extract user ID from request correctly', async () => {
            const customRequest = { user: { id: 42 } };
            mockVotesService.getUserVote.mockResolvedValue(expectedVoteDto);

            await controller.getUserVote(1, customRequest);

            expect(votesService.getUserVote).toHaveBeenCalledWith(42, 1);
        });
    });
});
