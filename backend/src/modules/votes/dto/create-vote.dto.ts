import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { VoteType } from 'src/common/enums/vote-type.enums';

/**
 * Data Transfer Object for creating a new vote on a report.
 * Contains only the vote type, as the report ID is provided via URL parameter
 * and user ID is extracted from the authentication token.
 */
export class CreateVoteDto {
    @ApiProperty({
        description: 'Type of vote to cast',
        enum: VoteType,
        example: VoteType.UPVOTE,
    })
    @IsEnum(VoteType, { message: 'Vote type must be either upvote or downvote' })
    type: VoteType;
}
