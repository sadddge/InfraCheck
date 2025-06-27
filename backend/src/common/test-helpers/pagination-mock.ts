/**
 * Shared pagination mock for nestjs-typeorm-paginate
 * This file should be imported at the top of test files that use pagination
 */

// Mock paginate function - this needs to be at module level
jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(),
    Pagination: jest.fn().mockImplementation((items, meta, links) => ({
        items,
        meta,
        links,
    })),
}));

// Export the mocked paginate function for use in tests
import { paginate } from 'nestjs-typeorm-paginate';
export const mockPaginate = paginate as jest.MockedFunction<typeof paginate>;
