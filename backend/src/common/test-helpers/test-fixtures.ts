import { Readable } from 'node:stream';
import { Comment } from '../../database/entities/comment.entity';
import { ReportChange } from '../../database/entities/report-change.entity';
import { ReportImage } from '../../database/entities/report-image.entity';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';
import { Vote } from '../../database/entities/vote.entity';
import { ReportCategory } from '../enums/report-category.enums';
import { ReportChangeType } from '../enums/report-change-type.enums';
import { ReportState } from '../enums/report-state.enums';
import { Role } from '../enums/roles.enums';
import { UserStatus } from '../enums/user-status.enums';
import { VoteType } from '../enums/vote-type.enums';

/**
 * Test fixtures for creating mock data
 */

/**
 * Creates a mock User entity
 */
export function createMockUser(overrides: Partial<User> = {}): User {
    const defaultUser: User = {
        id: 1,
        name: 'Test User',
        lastName: 'Test Last',
        phoneNumber: '+1234567890',
        password: 'hashedPassword',
        role: Role.NEIGHBOR,
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        passwordUpdatedAt: null,
        refreshTokens: [],
        reports: [],
        comments: [],
        votes: [],
        reportChanges: [],
        messages: [],
        reportsFollowed: [],
    };

    return { ...defaultUser, ...overrides };
}

/**
 * Creates a mock Report entity
 */
export function createMockReport(overrides: Partial<Report> = {}): Report {
    const mockUser = createMockUser();

    const defaultReport: Report = {
        id: 1,
        title: 'Test Report',
        description: 'Test description',
        category: ReportCategory.INFRASTRUCTURE,
        state: ReportState.PENDING,
        isVisible: true,
        latitude: -33.4489,
        longitude: -70.6693,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        creator: mockUser,
        images: [],
        changes: [],
        comments: [],
        votes: [],
        followers: [],
    };

    return { ...defaultReport, ...overrides };
}

/**
 * Creates a mock ReportImage entity
 */
export function createMockReportImage(overrides: Partial<ReportImage> = {}): ReportImage {
    const defaultImage: ReportImage = {
        id: 1,
        imageUrl: 'https://example.com/image1.jpg',
        takenAt: new Date('2024-01-01T10:00:00Z'),
        latitude: -33.4489,
        longitude: -70.6693,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        report: {} as Report,
    };

    return { ...defaultImage, ...overrides };
}

/**
 * Creates a mock ReportChange entity
 */
export function createMockReportChange(overrides: Partial<ReportChange> = {}): ReportChange {
    const mockUser = createMockUser();
    const mockReport = createMockReport();

    const defaultChange: ReportChange = {
        id: 1,
        changeType: ReportChangeType.STATE,
        from: ReportState.PENDING,
        to: ReportState.IN_PROGRESS,
        createdAt: new Date('2024-01-02T10:00:00Z'),
        creator: mockUser,
        report: mockReport,
    };

    return { ...defaultChange, ...overrides };
}

/**
 * Creates a mock Comment entity
 */
export function createMockComment(overrides: Partial<Comment> = {}): Comment {
    const mockUser = createMockUser();
    const mockReport = createMockReport();

    const defaultComment: Comment = {
        id: 1,
        content: 'Test comment',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        creator: mockUser,
        report: mockReport,
    };

    return { ...defaultComment, ...overrides };
}

/**
 * Creates a mock Vote entity
 */
export function createMockVote(overrides: Partial<Vote> = {}): Vote {
    const mockUser = createMockUser();
    const mockReport = createMockReport();

    const defaultVote: Vote = {
        id: 1,
        type: VoteType.UPVOTE,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        user: mockUser,
        report: mockReport,
    };

    return { ...defaultVote, ...overrides };
}

/**
 * Creates multiple mock reports
 */
export function createMockReports(count: number): Report[] {
    return Array.from({ length: count }, (_, index) =>
        createMockReport({
            id: index + 1,
            title: `Test Report ${index + 1}`,
            description: `Description ${index + 1}`,
        }),
    );
}

/**
 * Creates multiple mock users
 */
export function createMockUsers(count: number): User[] {
    return Array.from({ length: count }, (_, index) =>
        createMockUser({
            id: index + 1,
            name: `User ${index + 1}`,
            phoneNumber: `+123456789${index}`,
        }),
    );
}

/**
 * Creates a mock Express.Multer.File
 */
export function createMockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
    const defaultFile: Express.Multer.File = {
        fieldname: 'images',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        stream: new Readable(),
    };

    return { ...defaultFile, ...overrides };
}

/**
 * Creates multiple mock files
 */
export function createMockFiles(count: number): Express.Multer.File[] {
    return Array.from({ length: count }, (_, index) =>
        createMockFile({
            originalname: `test${index + 1}.jpg`,
            buffer: Buffer.from(`fake-image-data-${index + 1}`),
            size: 1024 * (index + 1),
        }),
    );
}
