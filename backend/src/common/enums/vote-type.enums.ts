/**
 * @enum {string} VoteType
 * @description Enumeration defining types of votes users can cast on infrastructure reports.
 * Enables community validation and prioritization of reported issues through democratic
 * feedback. Vote aggregation helps determine report importance and guides administrative
 * attention to the most critical infrastructure problems.
 *
 * @example
 * ```typescript
 * // Casting an upvote
 * const vote = new Vote();
 * vote.type = VoteType.UPVOTE;
 * vote.user = currentUser;
 * vote.report = targetReport;
 *
 * // Calculating vote scores
 * const upvotes = report.votes.filter(v => v.type === VoteType.UPVOTE).length;
 * const downvotes = report.votes.filter(v => v.type === VoteType.DOWNVOTE).length;
 * const score = upvotes - downvotes;
 *
 * // Prioritizing reports by community vote
 * const highPriorityReports = reports
 *   .filter(r => getVoteScore(r) > 10)
 *   .sort((a, b) => getVoteScore(b) - getVoteScore(a));
 * ```
 *
 * @since 1.0.0
 */
export enum VoteType {
    /**
     * @description Positive vote indicating community agreement with the report's
     * importance, accuracy, or urgency. Upvotes increase the report's visibility
     * and priority score, suggesting the issue needs prompt attention.
     *
     * @example User agrees the pothole is dangerous and needs immediate repair
     */
    UPVOTE = 'upvote',

    /**
     * @description Negative vote indicating community disagreement with the report's
     * importance, accuracy, or priority. Downvotes decrease the report's priority
     * score, suggesting the issue may be less urgent or inaccurate.
     *
     * @example User believes the reported issue is minor or already resolved
     */
    DOWNVOTE = 'downvote',
}
