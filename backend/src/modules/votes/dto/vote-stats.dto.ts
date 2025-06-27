import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * Data Transfer Object for returning vote statistics for a report.
 * Contains upvote count, downvote count, and total score.
 */
export class VoteStatsDto {
    @ApiProperty({
        description: 'Number of upvotes received',
        example: 15,
    })
    @Expose()
    upvotes: number;

    @ApiProperty({
        description: 'Number of downvotes received',
        example: 3,
    })
    @Expose()
    downvotes: number;

    @ApiProperty({
        description: 'Total vote score (upvotes - downvotes)',
        example: 12,
    })
    @Expose()
    score: number;

    @ApiProperty({
        description: 'Total number of votes cast',
        example: 18,
    })
    @Expose()
    totalVotes: number;
}
