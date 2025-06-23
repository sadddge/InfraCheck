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
 * Common mock for nestjs-typeorm-paginate
 */
export const mockPaginate = jest.fn();

/**
 * Mock setup for external libraries
 */
export function setupMocks() {
    // Mock class-validator
    jest.mock('class-validator', () => mockClassValidator);

    // Mock class-transformer
    jest.mock('class-transformer', () => mockClassTransformer);

    // Mock nestjs-typeorm-paginate
    jest.mock('nestjs-typeorm-paginate', () => ({
        paginate: mockPaginate,
        Pagination: jest.fn().mockImplementation((items, meta, links) => ({
            items,
            meta,
            links,
        })),
    }));
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
