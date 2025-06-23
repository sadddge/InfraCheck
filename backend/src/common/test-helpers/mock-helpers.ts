/**
 * Common mock implementations for services
 */

/**
 * Creates a jest mock function
 */
export function createMockFunction() {
    return jest.fn();
}

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
 * Centralized pagination mock setup for nestjs-typeorm-paginate
 * Returns the mocked paginate function for use in tests.
 */
export function mockNestjsTypeormPaginate() {
    const mockPaginate = jest.fn();
    jest.mock('nestjs-typeorm-paginate', () => ({
        paginate: mockPaginate,
        Pagination: jest.fn().mockImplementation((items, meta, links) => ({
            items,
            meta,
            links,
        })),
    }));

    return mockPaginate;
}

/**
 * Mock setup for external libraries
 */
export function setupMocks() {
    // Mock class-validator
    jest.mock('class-validator', () => mockClassValidator);

    // Mock class-transformer
    jest.mock('class-transformer', () => mockClassTransformer);

    // Mock nestjs-typeorm-paginate
    mockNestjsTypeormPaginate();
}

/**
 * Reset all mocks
 */
export function resetMocks() {
    jest.clearAllMocks();
}

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
 * Creates a mock service with common methods
 */
export function createMockService<T>(methods: (keyof T)[]): jest.Mocked<T> {
    const mockService = {} as jest.Mocked<T>;

    for (const method of methods) {
        (mockService[method] as jest.Mock) = jest.fn();
    }

    return mockService;
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
 * Creates a mock user service
 */
export function createMockUserService() {
    return {
        findByPhoneNumberWithPassword: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
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
