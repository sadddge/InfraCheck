import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { Equal, Repository } from 'typeorm';
import {
    FollowActionResponseDto,
    FollowStatusResponseDto,
    ReportFollowersIdsResponseDto,
    ReportFollowersResponseDto,
    UserFollowedReportsResponseDto,
} from '../dto';
import { IFollowsService } from '../interfaces/follows-service.interface';

/**
 * Service for managing user follow actions on reports.
 *
 * Provides methods to follow and unfollow reports, check follow status,
 * retrieve followers of a report, and get reports followed by a user.
 * Handles validation and error management for follow-related operations.
 *
 * @remarks
 * This service uses TypeORM repositories for `User` and `Report` entities,
 * and assumes a many-to-many relationship between users and reports via a
 * `followers` relation on the `Report` entity.
 *
 * @implements {IFollowsService}
 */
@Injectable()
export class FollowsService implements IFollowsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
    ) {}

    /**
     * Allows a user to follow a specific report.
     *
     * This method first validates the existence of the user and the report.
     * It then checks if the user is already following the report. If so, it throws a
     * `ConflictException`. Otherwise, it adds the user as a follower of the report.
     *
     * @param userId - The ID of the user who wants to follow the report.
     * @param reportId - The ID of the report to be followed.
     * @returns A promise that resolves to a `FollowActionResponseDto` containing a success message.
     * @throws {ConflictException} If the user is already following the report.
     * @throws {NotFoundException} If the user or report does not exist.
     * @throws {InternalServerErrorException} For other unexpected errors.
     */
    async followReport(userId: number, reportId: number): Promise<FollowActionResponseDto> {
        try {
            await this.validateUserAndReport(userId, reportId);

            // Verificar si ya está siguiendo el reporte
            const isAlreadyFollowing = await this.isFollowingReport(userId, reportId);
            if (isAlreadyFollowing.isFollowing) {
                throw new ConflictException('User is already following this report');
            }

            // Seguir el reporte
            await this.reportRepository
                .createQueryBuilder()
                .relation(Report, 'followers')
                .of(reportId)
                .add(userId);

            return { message: 'Report followed successfully' };
        } catch (error) {
            this.handleError(error, 'Failed to follow report');
        }
    }

    /**
     * Unfollows a report for a given user.
     *
     * Validates the user and report, checks if the user is currently following the report,
     * and removes the follow relationship if present. Throws a ConflictException if the user
     * is not following the report. Handles errors and returns a response message upon success.
     *
     * @param userId - The ID of the user who wants to unfollow the report.
     * @param reportId - The ID of the report to unfollow.
     * @returns A promise that resolves to a FollowActionResponseDto containing a success message.
     * @throws {ConflictException} If the user is not following the report.
     * @throws {Error} If an error occurs during the operation.
     */
    async unfollowReport(userId: number, reportId: number): Promise<FollowActionResponseDto> {
        try {
            await this.validateUserAndReport(userId, reportId);

            // Verificar si está siguiendo el reporte
            const isFollowing = await this.isFollowingReport(userId, reportId);
            if (!isFollowing.isFollowing) {
                throw new ConflictException('User is not following this report');
            }

            // Dejar de seguir el reporte
            await this.reportRepository
                .createQueryBuilder()
                .relation(Report, 'followers')
                .of(reportId)
                .remove(userId);

            return { message: 'Report unfollowed successfully' };
        } catch (error) {
            this.handleError(error, 'Failed to unfollow report');
        }
    }

    /**
     * Checks if a user is following a specific report.
     *
     * @param userId - The ID of the user to check.
     * @param reportId - The ID of the report to check.
     * @returns A promise that resolves to a {@link FollowStatusResponseDto} indicating whether the user is following the report.
     * @throws {BadRequestException} If either userId or reportId is missing or invalid.
     * @throws {InternalServerErrorException} If an error occurs during the database query.
     */
    async isFollowingReport(userId: number, reportId: number): Promise<FollowStatusResponseDto> {
        try {
            // Solo validar que los parámetros no sean nulos/undefined
            if (!userId || !reportId) {
                throw new BadRequestException('User ID and Report ID are required');
            }

            const count = await this.reportRepository
                .createQueryBuilder('report')
                .innerJoin('report.followers', 'follower', 'follower.id = :userId', { userId })
                .where('report.id = :reportId', { reportId })
                .getCount();

            return { isFollowing: count > 0 };
        } catch (error) {
            this.handleError(error, 'Failed to check follow status');
        }
    }

    /**
     * Retrieves the list of followers for a specific report by its ID.
     *
     * @param reportId - The unique identifier of the report whose followers are to be fetched.
     * @returns A promise that resolves to a `ReportFollowersResponseDto` containing the names of the followers.
     * @throws Will handle and rethrow errors if the report validation fails or if there is an issue fetching the followers.
     */
    async getReportFollowers(reportId: number): Promise<ReportFollowersResponseDto> {
        try {
            await this.validateReport(reportId);

            const report = await this.reportRepository
                .createQueryBuilder('report')
                .leftJoinAndSelect('report.followers', 'follower')
                .where('report.id = :reportId', { reportId })
                .getOne();

            return {
                followers: report?.followers.map(follower => follower.name) || [],
            };
        } catch (error) {
            this.handleError(error, 'Failed to get report followers');
        }
    }

    /**
     * Retrieves the list of report IDs that a specific user is following, along with the total count.
     *
     * @param userId - The unique identifier of the user whose followed reports are to be fetched.
     * @returns A promise that resolves to an object containing an array of report IDs and the total number of followed reports.
     * @throws Will handle and rethrow errors encountered during user validation or database queries.
     */
    async getUserFollowedReports(userId: number): Promise<UserFollowedReportsResponseDto> {
        try {
            await this.validateUser(userId);

            const [reports, total] = await this.reportRepository
                .createQueryBuilder('report')
                .innerJoin('report.followers', 'follower', 'follower.id = :userId', { userId })
                .select(['report.id'])
                .getManyAndCount();

            return {
                reports: reports.map(report => report.id),
                total,
            };
        } catch (error) {
            this.handleError(error, 'Failed to get user followed reports');
        }
    }

    /**
     * Retrieves the IDs of all followers for a given report.
     *
     * @param reportId - The unique identifier of the report whose followers' IDs are to be fetched.
     * @returns A promise that resolves to a `ReportFollowersIdsResponseDto` containing an array of follower IDs.
     * @throws Will handle and rethrow errors if the report validation fails or if there is an issue fetching the followers.
     */
    async getFollowersIds(reportId: number): Promise<ReportFollowersIdsResponseDto> {
        try {
            await this.validateReport(reportId);

            const report = await this.reportRepository
                .createQueryBuilder('report')
                .leftJoinAndSelect('report.followers', 'follower')
                .where('report.id = :reportId', { reportId })
                .getOne();

            return {
                followers: report?.followers.map(follower => follower.id) || [],
            };
        } catch (error) {
            this.handleError(error, 'Failed to get followers IDs');
        }
    }

    /**
     * Validates the existence of a user by their ID.
     *
     * @param userId - The unique identifier of the user to validate.
     * @returns A promise that resolves to the found {@link User} entity.
     * @throws {BadRequestException} If the userId is not provided.
     * @throws {NotFoundException} If no user is found with the given ID.
     */
    private async validateUser(userId: number): Promise<User> {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }

        const user = await this.userRepository.findOne({ where: { id: Equal(userId) } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user;
    }

    /**
     * Validates the existence of a report by its ID.
     *
     * @param reportId - The unique identifier of the report to validate.
     * @returns A promise that resolves to the found {@link Report} entity.
     * @throws {BadRequestException} If the report ID is not provided.
     * @throws {NotFoundException} If no report is found with the given ID.
     */
    private async validateReport(reportId: number): Promise<Report> {
        if (!reportId) {
            throw new BadRequestException('Report ID is required');
        }

        const report = await this.reportRepository.findOne({ where: { id: Equal(reportId) } });
        if (!report) {
            throw new NotFoundException(`Report with ID ${reportId} not found`);
        }

        return report;
    }

    /**
     * Validates the existence of a user and a report by their respective IDs.
     *
     * @param userId - The unique identifier of the user to validate.
     * @param reportId - The unique identifier of the report to validate.
     * @returns A promise that resolves to an object containing the validated user and report.
     * @throws Will throw an error if either the user or the report does not exist or fails validation.
     */
    private async validateUserAndReport(
        userId: number,
        reportId: number,
    ): Promise<{ user: User; report: Report }> {
        const [user, report] = await Promise.all([
            this.validateUser(userId),
            this.validateReport(reportId),
        ]);

        return { user, report };
    }

    /**
     * Handles errors by rethrowing specific known exceptions or throwing a generic BadRequestException.
     *
     * @param error - The error object to handle.
     * @param defaultMessage - The default error message to use if the error is not a known exception.
     * @throws NotFoundException | ConflictException | BadRequestException - Rethrows if the error is one of these types.
     * @throws BadRequestException - Throws with the provided default message if the error is not a known exception.
     */
    private handleError(error: unknown, defaultMessage: string): never {
        if (
            error instanceof NotFoundException ||
            error instanceof ConflictException ||
            error instanceof BadRequestException
        ) {
            throw error;
        }
        throw new BadRequestException(defaultMessage);
    }
}
