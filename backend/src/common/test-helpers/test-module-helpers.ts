/**
 * Test module creation helpers for reducing boilerplate in test files
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Provider } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { createMockRepository, createMockService } from './mock-helpers';

/**
 * Creates a basic test module with service and repository providers
 */
export async function createTestModuleWithRepository<TService, TEntity extends ObjectLiteral>(
    serviceClass: new (...args: unknown[]) => TService,
    repositoryToken: string | symbol,
    additionalProviders: Provider[] = []
): Promise<{
    module: TestingModule;
    service: TService;
    repository: jest.Mocked<Repository<TEntity>>;
}> {
    const mockRepository = createMockRepository<Repository<TEntity>>();

    const module: TestingModule = await Test.createTestingModule({
        providers: [
            serviceClass,
            {
                provide: repositoryToken,
                useValue: mockRepository,
            },
            ...additionalProviders,
        ],
    }).compile();

    const service = module.get<TService>(serviceClass);
    const repository = module.get<jest.Mocked<Repository<TEntity>>>(repositoryToken);

    return { module, service, repository };
}

/**
 * Creates a test module with service and multiple repository providers
 */
export async function createTestModuleWithMultipleRepositories<TService>(
    serviceClass: new (...args: unknown[]) => TService,
    repositoryTokens: Array<{ token: string | symbol; mockName?: string }>,
    additionalProviders: Provider[] = []
): Promise<{
    module: TestingModule;
    service: TService;
    repositories: Record<string, jest.Mocked<Repository<ObjectLiteral>>>;
}> {
    const repositories: Record<string, jest.Mocked<Repository<ObjectLiteral>>> = {};
    const providers: Provider[] = [serviceClass];

    // Create mock repositories
    for (const { token, mockName } of repositoryTokens) {
        const mockRepository = createMockRepository<Repository<ObjectLiteral>>();
        const repoName = mockName ?? token.toString();
        repositories[repoName] = mockRepository;
        
        providers.push({
            provide: token,
            useValue: mockRepository,
        });
    }

    const module: TestingModule = await Test.createTestingModule({
        providers: [...providers, ...additionalProviders],
    }).compile();

    const service = module.get<TService>(serviceClass);

    // Get actual repositories from module for accurate typing
    for (const { token, mockName } of repositoryTokens) {
        const repoName = mockName ?? token.toString();
        repositories[repoName] = module.get(token);
    }

    return { module, service, repositories };
}

/**
 * Creates a test module for controller testing with service dependencies
 */
export async function createTestModuleWithController<TController, TService>(
    controllerClass: new (...args: unknown[]) => TController,
    serviceToken: string | symbol,
    serviceMethods: string[],
    additionalProviders: Provider[] = []
): Promise<{
    module: TestingModule;
    controller: TController;
    service: jest.Mocked<TService>;
}> {
    const mockService = createMockService<TService>(serviceMethods as (keyof TService)[]);

    const module: TestingModule = await Test.createTestingModule({
        controllers: [controllerClass],
        providers: [
            {
                provide: serviceToken,
                useValue: mockService,
            },
            ...additionalProviders,
        ],
    }).compile();

    const controller = module.get<TController>(controllerClass);
    const service = module.get<jest.Mocked<TService>>(serviceToken);

    return { module, controller, service };
}

/**
 * Standard afterEach cleanup for tests
 */
export function setupTestCleanup() {
    afterEach(() => {
        jest.clearAllMocks();
    });
}

/**
 * Pagination mock setup that can be imported in test files
 */
export function setupPaginationMock() {
    // Mock paginate function
    jest.mock('nestjs-typeorm-paginate', () => ({
        paginate: jest.fn(),
        Pagination: jest.fn().mockImplementation((items, meta, links) => ({
            items,
            meta,
            links,
        })),
    }));

    // Return import and mock function for use in tests
    const { paginate } = require('nestjs-typeorm-paginate');
    return paginate;
}
