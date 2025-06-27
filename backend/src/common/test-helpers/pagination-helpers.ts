import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

/**
 * Test utilities for pagination testing
 */

/**
 * Creates a mock pagination response
 */
export function createMockPaginationResponse<T>(
    items: T[],
    options: {
        page?: number;
        limit?: number;
        totalItems?: number;
    } = {},
): Pagination<T> {
    const { page = 1, limit = 10, totalItems = items.length } = options;
    const totalPages = Math.ceil(totalItems / limit);

    const meta: IPaginationMeta = {
        itemCount: items.length,
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
    };

    return {
        items,
        meta,
        links: {
            first: 'http://localhost:3000?page=1',
            previous: page > 1 ? `http://localhost:3000?page=${page - 1}` : '',
            next: page < totalPages ? `http://localhost:3000?page=${page + 1}` : '',
            last: `http://localhost:3000?page=${totalPages}`,
        },
    };
}

/**
 * Creates an empty pagination response
 */
export function createEmptyPaginationResponse<T>(): Pagination<T> {
    return createMockPaginationResponse<T>([], {
        page: 1,
        limit: 10,
        totalItems: 0,
    });
}

/**
 * Default pagination DTO for tests
 */
export const DEFAULT_PAGINATION_DTO = { page: 1, limit: 10 };

/**
 * Creates pagination DTO with custom values
 */
export function createPaginationDto(page = 1, limit = 10) {
    return { page, limit };
}
