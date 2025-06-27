import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VoteType } from 'src/common/enums/vote-type.enums';

/**
 * Data Transfer Object for returning vote information.
 * Contains vote details including ID, type, and creation timestamp.
 */
export class VoteDto {
    @ApiProperty({
        description: 'Unique identifier of the vote',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'Type of vote cast',
        enum: VoteType,
        example: VoteType.UPVOTE,
    })
    type: VoteType;

    @ApiProperty({
        description: 'ID of the user who cast the vote',
        example: 1,
    })
    userId: number;

    @ApiProperty({
        description: 'ID of the report that was voted on',
        example: 1,
    })
    reportId: number;

    @ApiProperty({
        description: 'Timestamp when the vote was created',
        example: '2025-06-24T10:30:00Z',
    })

    @Type(() => Date)
    createdAt: Date;
}
