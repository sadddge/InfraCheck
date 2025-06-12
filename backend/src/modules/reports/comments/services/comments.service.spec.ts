import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from 'src/database/entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentsService } from './comments.service';

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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAllByReportId', () => {
        it('should return an array of comment DTOs for a given report ID', async () => {
            // Arrange
            const reportId = 1;
            const mockComments = [
                {
                    id: 1,
                    content: 'Test comment',
                    createdAt: new Date(),
                    creator: { id: 1, name: 'John', lastName: 'Doe' },
                    report: { id: 1, title: 'Test Report' },
                },
            ];

            mockRepository.find.mockResolvedValue(mockComments);

            // Act
            const result = await service.findAllByReportId(reportId);

            // Assert
            expect(repository.find).toHaveBeenCalledWith({
                where: { report: { id: expect.any(Object) } },
                relations: ['creator', 'report'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
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
            mockRepository.find.mockResolvedValue([]);

            // Act
            const result = await service.findAllByReportId(reportId);

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle database errors', async () => {
            // Arrange
            const reportId = 1;
            const error = new Error('Database error');
            mockRepository.find.mockRejectedValue(error);

            // Act & Assert
            await expect(service.findAllByReportId(reportId)).rejects.toThrow('Database error');
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

            mockRepository.find.mockResolvedValue([mockComment]);

            // Act
            const result = await service.findAllByReportId(reportId);

            // Assert
            expect(result[0]).toEqual({
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

            mockRepository.find.mockResolvedValue([mockComment]);

            // Act
            const result = await service.findAllByReportId(reportId);

            // Assert
            expect(result[0].content).toBe(specialContent);
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

            mockRepository.find.mockResolvedValue(mockComments);

            // Act
            const result = await service.findAllByReportId(reportId);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(2); // More recent first due to DESC order
            expect(result[1].id).toBe(1);
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
