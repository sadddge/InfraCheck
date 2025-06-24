import { CreateVoteDto } from '../dto/create-vote.dto';
import { VoteStatsDto } from '../dto/vote-stats.dto';
import { VoteDto } from '../dto/vote.dto';

/**
 * Interface defining the contract for the votes service.
 * Provides methods for vote management including creation, removal, and statistics.
 */
export interface IVotesService {
    /**
     * Creates or updates a vote for a specific report by a user.
     * If the user has already voted with the same type, throws duplicate vote error.
     * If the user has voted with a different type, updates the vote.
     * If the user hasn't voted, creates a new vote.
     *
     * @param userId - ID of the user casting the vote
     * @param reportId - ID of the report being voted on
     * @param createVoteDto - DTO containing the vote type
     * @returns Promise resolving to the created/updated vote
     * @throws AppException with DUPLICATE_VOTE error if user tries to cast same vote type twice
     */
    vote(userId: number, reportId: number, createVoteDto: CreateVoteDto): Promise<VoteDto>;

    /**
     * Removes a user's vote from a specific report.
     *
     * @param userId - ID of the user whose vote to remove
     * @param reportId - ID of the report to remove vote from
     * @returns Promise resolving to true if vote was removed, false if no vote existed
     */
    removeVote(userId: number, reportId: number): Promise<boolean>;

    /**
     * Retrieves vote statistics for a specific report.
     *
     * @param reportId - ID of the report to get statistics for
     * @returns Promise resolving to vote statistics
     */
    getVoteStats(reportId: number): Promise<VoteStatsDto>;

    /**
     * Retrieves a user's current vote for a specific report.
     *
     * @param userId - ID of the user
     * @param reportId - ID of the report
     * @returns Promise resolving to the user's vote
     * @throws AppException with VOTE_NOT_FOUND error if no vote exists
     */
    getUserVote(userId: number, reportId: number): Promise<VoteDto>;
}

/**
 * Injection token for the votes service.
 */
export const VOTES_SERVICE = 'VOTES_SERVICE';
