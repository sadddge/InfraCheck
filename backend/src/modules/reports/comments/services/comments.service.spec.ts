import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from 'src/database/entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentsService } from './comments.service';

// Mock paginate function
jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(),
    Pagination: jest.fn().mockImplementation((items, meta, links) => ({
        items,
        meta,
        links,
    })),
}));

import { paginate } from 'nestjs-typeorm-paginate';
const mockPaginate = paginate as jest.MockedFunction<typeof paginate>;

describe('CommentsService', () => {
    let service: CommentsService;
    let repository: Repository<Comment>;

    const mockRepository = {
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                {
                    provide: getRepositoryToken(Comment),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<CommentsService>(CommentsService);
        repository = module.get<Repository<Comment>>(getRepositoryToken(Comment));

        // Reset mocks before each test
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAllByReportId', () => {
        it('should return an array of comment DTOs for a given report ID', async () => {
            // Arrange
            const reportId = 1;
            const options = { page: 1, limit: 10 };
            const mockComments = [
                {
                    id: 1,
                    content: 'Test comment',
                    createdAt: new Date(),
                    creator: { id: 1, name: 'John', lastName: 'Doe' },
                    report: { id: 1, title: 'Test Report' },
                },
            ];

            const mockPaginatedResponse = {
                items: mockComments,
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'http://localhost:3000/comments?page=1',
                    previous: '',
                    next: '',
                    last: 'http://localhost:3000/comments?page=1',
                },
            };

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findAllByReportId(reportId, options);

            // Assert
            expect(mockPaginate).toHaveBeenCalledWith(repository, options, {
                where: { report: { id: expect.any(Object) } },
                relations: ['creator', 'report'],
                order: { createdAt: 'DESC' },
            });
            expect(result.items).toHaveLength(1);
            expect(result.items[0]).toEqual({
                id: 1,
                content: 'Test comment',
                createdAt: mockComments[0].createdAt,
                creator: {
                    id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                },
                report: {
                    id: 1,
                    title: 'Test Report',
                },
            });
        });
        it('should return an empty array when no comments exist for the report', async () => {
            // Arrange
            const reportId = 1;
            const options = { page: 1, limit: 10 };

            const mockPaginatedResponse = {
                items: [],
                meta: {
                    totalItems: 0,
                    itemCount: 0,
                    itemsPerPage: 10,
                    totalPages: 0,
                    currentPage: 1,
                },
                links: {
                    first: '',
                    previous: '',
                    next: '',
                    last: '',
                },
            };

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findAllByReportId(reportId, options);

            // Assert
            expect(result.items).toEqual([]);
        });
        it('should handle database errors', async () => {
            // Arrange
            const reportId = 1;
            const options = { page: 1, limit: 10 };
            const error = new Error('Database error');
            mockPaginate.mockRejectedValue(error);

            // Act & Assert
            await expect(service.findAllByReportId(reportId, options)).rejects.toThrow(
                'Database error',
            );
        });
    });

    describe('createComment', () => {
        it('should create and return a new comment', async () => {
            // Arrange
            const reportId = 1;
            const userId = 1;
            const createCommentDto: CreateCommentDto = { content: 'New comment' };

            const mockCreatedComment = {
                content: 'New comment',
                report: { id: reportId },
                creator: { id: userId },
            };

            const mockSavedComment = {
                id: 1,
                content: 'New comment',
                createdAt: new Date(),
                creator: { id: 1, name: 'John', lastName: 'Doe' },
                report: { id: 1, title: 'Test Report' },
            };

            mockRepository.create.mockReturnValue(mockCreatedComment);
            mockRepository.save.mockResolvedValue(mockSavedComment);

            // Act
            const result = await service.createComment(reportId, userId, createCommentDto);

            // Assert
            expect(repository.create).toHaveBeenCalledWith({
                content: 'New comment',
                report: { id: reportId },
                creator: { id: userId },
            });
            expect(repository.save).toHaveBeenCalledWith(mockCreatedComment);
            expect(result).toEqual({
                id: 1,
                content: 'New comment',
                createdAt: mockSavedComment.createdAt,
                creator: {
                    id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                },
                report: {
                    id: 1,
                    title: 'Test Report',
                },
            });
        });

        it('should handle save errors', async () => {
            // Arrange
            const reportId = 1;
            const userId = 1;
            const createCommentDto: CreateCommentDto = { content: 'New comment' };
            const error = new Error('Save error');

            mockRepository.create.mockReturnValue({});
            mockRepository.save.mockRejectedValue(error);

            // Act & Assert
            await expect(service.createComment(reportId, userId, createCommentDto)).rejects.toThrow(
                'Save error',
            );
        });
    });

    describe('delete', () => {
        it('should delete a comment by ID', async () => {
            // Arrange
            const commentId = 1;
            mockRepository.delete.mockResolvedValue({ affected: 1 });

            // Act
            await service.delete(commentId);

            // Assert
            expect(repository.delete).toHaveBeenCalledWith({ id: commentId });
        });

        it('should handle delete errors', async () => {
            // Arrange
            const commentId = 1;
            const error = new Error('Delete error');
            mockRepository.delete.mockRejectedValue(error);

            // Act & Assert
            await expect(service.delete(commentId)).rejects.toThrow('Delete error');
        });

        it('should not throw error when deleting non-existent comment', async () => {
            // Arrange
            const commentId = 999;
            mockRepository.delete.mockResolvedValue({ affected: 0 });

            // Act & Assert
            await expect(service.delete(commentId)).resolves.not.toThrow();
        });
    });

    describe('mapToDto (private method testing through public methods)', () => {
        it('should correctly map comment entity to DTO', async () => {
            // Arrange
            const reportId = 1;
            const mockComment = {
                id: 1,
                content: 'Test content',
                createdAt: new Date('2023-01-01'),
                creator: { id: 2, name: 'Jane', lastName: 'Smith' },
                report: { id: 1, title: 'Sample Report' },
            };

            const mockPaginatedResponse = {
                items: [mockComment],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'http://localhost:3000/comments?page=1',
                    previous: '',
                    next: '',
                    last: 'http://localhost:3000/comments?page=1',
                },
            };

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findAllByReportId(reportId, { page: 1, limit: 10 });

            // Assert
            expect(result.items[0]).toEqual({
                id: 1,
                content: 'Test content',
                createdAt: new Date('2023-01-01'),
                creator: {
                    id: 2,
                    firstName: 'Jane',
                    lastName: 'Smith',
                },
                report: {
                    id: 1,
                    title: 'Sample Report',
                },
            });
        });
        it('should handle special characters in content', async () => {
            // Arrange
            const reportId = 1;
            const specialContent = 'Comment with special chars: áéíóú ñ @#$%^&*()';
            const mockComment = {
                id: 1,
                content: specialContent,
                createdAt: new Date(),
                creator: { id: 1, name: 'Test', lastName: 'User' },
                report: { id: 1, title: 'Test Report' },
            };

            const mockPaginatedResponse = {
                items: [mockComment],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'http://localhost:3000/comments?page=1',
                    previous: '',
                    next: '',
                    last: 'http://localhost:3000/comments?page=1',
                },
            };

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findAllByReportId(reportId, { page: 1, limit: 10 });

            // Assert
            expect(result.items[0].content).toBe(specialContent);
        });
    });

    describe('Edge cases and integration scenarios', () => {
        it('should handle multiple comments with correct ordering', async () => {
            // Arrange
            const reportId = 1;
            const date1 = new Date('2023-01-01');
            const date2 = new Date('2023-01-02');

            const mockComments = [
                {
                    id: 2,
                    content: 'Second comment',
                    createdAt: date2,
                    creator: { id: 1, name: 'John', lastName: 'Doe' },
                    report: { id: 1, title: 'Test Report' },
                },
                {
                    id: 1,
                    content: 'First comment',
                    createdAt: date1,
                    creator: { id: 2, name: 'Jane', lastName: 'Smith' },
                    report: { id: 1, title: 'Test Report' },
                },
            ];

            const mockPaginatedResponse = {
                items: mockComments,
                meta: {
                    totalItems: 2,
                    itemCount: 2,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'http://localhost:3000/comments?page=1',
                    previous: '',
                    next: '',
                    last: 'http://localhost:3000/comments?page=1',
                },
            };

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findAllByReportId(reportId, { page: 1, limit: 10 });

            // Assert
            expect(result.items).toHaveLength(2);
            expect(result.items[0].id).toBe(2); // More recent first due to DESC order
            expect(result.items[1].id).toBe(1);
        });

        it('should handle large comment content', async () => {
            // Arrange
            const reportId = 1;
            const userId = 1;
            const largeContent = 'A'.repeat(1000); // 1000 character string
            const createCommentDto: CreateCommentDto = { content: largeContent };

            const mockSavedComment = {
                id: 1,
                content: largeContent,
                createdAt: new Date(),
                creator: { id: 1, name: 'John', lastName: 'Doe' },
                report: { id: 1, title: 'Test Report' },
            };

            mockRepository.create.mockReturnValue({});
            mockRepository.save.mockResolvedValue(mockSavedComment);

            // Act
            const result = await service.createComment(reportId, userId, createCommentDto);

            // Assert
            expect(result.content).toBe(largeContent);
            expect(result.content.length).toBe(1000);
        });
    });
});
