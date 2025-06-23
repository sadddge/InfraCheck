/**
 * Common mock implementations for services
 */

/**
 * Common mock for class-validator
 */
export const mockClassValidator = {
    validate: jest.fn(),
    IsDateString: () => () => {},
    IsString: () => () => {},
    IsNumber: () => () => {},
    IsEnum: () => () => {},
    MinLength: () => () => {},
    MaxLength: () => () => {},
    IsArray: () => () => {},
    ValidateNested: () => () => {},
    IsOptional: () => () => {},
    Min: () => () => {},
    Max: () => () => {},
};

/**
 * Common mock for class-transformer
 */
export const mockClassTransformer = {
    plainToInstance: jest.fn(),
    Type: () => () => {},
};

/**
 * Creates a mock repository
 */
export function createMockRepository<T>() {
    return {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            innerJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
            getMany: jest.fn(),
            getManyAndCount: jest.fn(),
        })),
    } as unknown as jest.Mocked<T>;
}

/**
 * Creates a mock reports service
 */
export function createMockReportsService() {
    return {
        findAll: jest.fn(),
        findById: jest.fn(),
        findHistoryByReportId: jest.fn(),
        createReport: jest.fn(),
        updateState: jest.fn(),
    };
}

/**
 * Creates a mock upload service
 */
export function createMockUploadService() {
    return {
        uploadFile: jest.fn(),
    };
}

/**
 * Creates a mock request object with user
 */
export function createMockRequest(userId = 1, userRole = 'neighbor') {
    return {
        user: {
            id: userId,
            role: userRole,
        },
    };
}
