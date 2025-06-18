import {
    FollowActionResponseDto,
    FollowStatusResponseDto,
    ReportFollowersIdsResponseDto,
    ReportFollowersResponseDto,
    UserFollowedReportsResponseDto,
} from '../dto';

export const FOLLOWS_SERVICE = 'FOLLOWS_SERVICE';

/**
 * Interface for managing follow relationships between users and reports.
 */
export interface IFollowsService {
    /**
     * Allows a user to follow a specific report.
     * @param userId - The ID of the user who wants to follow the report.
     * @param reportId - The ID of the report to be followed.
     * @returns A promise that resolves to the result of the follow action.
     */
    followReport(userId: number, reportId: number): Promise<FollowActionResponseDto>;

    /**
     * Allows a user to unfollow a specific report.
     * @param userId - The ID of the user who wants to unfollow the report.
     * @param reportId - The ID of the report to be unfollowed.
     * @returns A promise that resolves to the result of the unfollow action.
     */
    unfollowReport(userId: number, reportId: number): Promise<FollowActionResponseDto>;

    /**
     * Checks if a user is currently following a specific report.
     * @param userId - The ID of the user.
     * @param reportId - The ID of the report.
     * @returns A promise that resolves to the follow status.
     */
    isFollowingReport(userId: number, reportId: number): Promise<FollowStatusResponseDto>;

    /**
     * Retrieves the list of followers for a specific report.
     * @param reportId - The ID of the report.
     * @returns A promise that resolves to the list of report followers.
     */
    getReportFollowers(reportId: number): Promise<ReportFollowersResponseDto>;

    /**
     * Retrieves the list of reports followed by a specific user.
     * @param userId - The ID of the user.
     * @returns A promise that resolves to the list of reports followed by the user.
     */
    getUserFollowedReports(userId: number): Promise<UserFollowedReportsResponseDto>;

    /**
     * Retrieves the IDs of all users following a specific report.
     * @param reportId - The ID of the report.
     * @returns A promise that resolves to the list of follower IDs.
     */
    getFollowersIds(reportId: number): Promise<ReportFollowersIdsResponseDto>;
}
