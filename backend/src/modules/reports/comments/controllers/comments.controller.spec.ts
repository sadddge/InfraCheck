import { Test, TestingModule } from '@nestjs/testing';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { COMMENTS_SERVICE, ICommentsService } from '../interfaces/comments-service.interface';
import { CommentsController } from './comments.controller';

describe('CommentsController', () => {
    let controller: CommentsController;
    let commentsService: jest.Mocked<ICommentsService>;

    const mockCommentsService = {
        findAllByReportId: jest.fn(),
        createComment: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentsController],
            providers: [{ provide: COMMENTS_SERVICE, useValue: mockCommentsService }],
        }).compile();

        controller = module.get<CommentsController>(CommentsController);
        commentsService = module.get(COMMENTS_SERVICE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAllByReportId', () => {
        it('should call commentsService.findAllByReportId with correct reportId and return comments', async () => {
            const reportId = 123;
            const paginationDto = { page: 1, limit: 10 };
            const mockPaginatedResponse = {
                items: [
                    {
                        id: 1,
                        content: 'This is a test comment',
                        createdAt: new Date(),
                        reportId: 123,
                        creatorId: 1,
                        creator: {
                            id: 1,
                            name: 'John',
                            lastName: 'Doe',
                            phoneNumber: '+56912345678',
                        },
                    },
                    {
                        id: 2,
                        content: 'Another test comment',
                        createdAt: new Date(),
                        reportId: 123,
                        creatorId: 2,
                        creator: {
                            id: 2,
                            name: 'Jane',
                            lastName: 'Smith',
                            phoneNumber: '+56987654321',
                        },
                    },
                ],
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

            mockCommentsService.findAllByReportId.mockResolvedValue(mockPaginatedResponse);

            const result = await controller.findAllByReportId(reportId, paginationDto);

            expect(commentsService.findAllByReportId).toHaveBeenCalledWith(reportId, paginationDto);
            expect(result).toEqual(mockPaginatedResponse);
        });
        it('should propagate errors from commentsService.findAllByReportId', async () => {
            const reportId = 999;
            const paginationDto = { page: 1, limit: 10 };
            const error = new Error('Report not found');
            mockCommentsService.findAllByReportId.mockRejectedValue(error);

            await expect(controller.findAllByReportId(reportId, paginationDto)).rejects.toThrow(
                'Report not found',
            );
            expect(commentsService.findAllByReportId).toHaveBeenCalledWith(reportId, paginationDto);
        });
        it('should return empty array when no comments exist for report', async () => {
            const reportId = 123;
            const paginationDto = { page: 1, limit: 10 };
            const emptyPaginatedResponse = {
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

            mockCommentsService.findAllByReportId.mockResolvedValue(emptyPaginatedResponse);

            const result = await controller.findAllByReportId(reportId, paginationDto);

            expect(commentsService.findAllByReportId).toHaveBeenCalledWith(reportId, paginationDto);
            expect(result).toEqual(emptyPaginatedResponse);
            expect(result.items).toEqual([]);
            expect(Array.isArray(result.items)).toBe(true);
        });
    });

    describe('createComment', () => {
        it('should call commentsService.createComment with correct parameters and return created comment', async () => {
            const reportId = 123;
            const createCommentDto: CreateCommentDto = {
                content: 'This is a new comment',
            };
            const mockRequest = {
                user: { id: 1 },
            };

            const expectedComment = {
                id: 1,
                content: 'This is a new comment',
                createdAt: new Date(),
                reportId: 123,
                creatorId: 1,
                creator: {
                    id: 1,
                    name: 'John',
                    lastName: 'Doe',
                    phoneNumber: '+56912345678',
                },
            };

            mockCommentsService.createComment.mockResolvedValue(expectedComment);

            const result = await controller.createComment(reportId, createCommentDto, mockRequest);

            expect(commentsService.createComment).toHaveBeenCalledWith(
                reportId,
                mockRequest.user.id,
                createCommentDto,
            );
            expect(result).toEqual(expectedComment);
        });

        it('should propagate errors from commentsService.createComment', async () => {
            const reportId = 999;
            const createCommentDto: CreateCommentDto = {
                content: 'This comment will fail',
            };
            const mockRequest = {
                user: { id: 1 },
            };

            const error = new Error('Report not found');
            mockCommentsService.createComment.mockRejectedValue(error);

            await expect(
                controller.createComment(reportId, createCommentDto, mockRequest),
            ).rejects.toThrow('Report not found');

            expect(commentsService.createComment).toHaveBeenCalledWith(
                reportId,
                mockRequest.user.id,
                createCommentDto,
            );
        });

        it('should handle validation errors when creating comment', async () => {
            const reportId = 123;
            const createCommentDto: CreateCommentDto = {
                content: '', // Empty content
            };
            const mockRequest = {
                user: { id: 1 },
            };

            const error = new Error('Comment content cannot be empty');
            mockCommentsService.createComment.mockRejectedValue(error);

            await expect(
                controller.createComment(reportId, createCommentDto, mockRequest),
            ).rejects.toThrow('Comment content cannot be empty');

            expect(commentsService.createComment).toHaveBeenCalledWith(
                reportId,
                mockRequest.user.id,
                createCommentDto,
            );
        });
    });

    describe('delete', () => {
        it('should call commentsService.delete with correct commentId', async () => {
            const commentId = 456;

            mockCommentsService.delete.mockResolvedValue(undefined);

            await controller.delete(commentId);

            expect(commentsService.delete).toHaveBeenCalledWith(commentId);
        });

        it('should propagate errors from commentsService.delete', async () => {
            const commentId = 999;
            const error = new Error('Comment not found');
            mockCommentsService.delete.mockRejectedValue(error);

            await expect(controller.delete(commentId)).rejects.toThrow('Comment not found');
            expect(commentsService.delete).toHaveBeenCalledWith(commentId);
        });

        it('should handle unauthorized deletion attempts', async () => {
            const commentId = 456;
            const error = new Error('Forbidden: You do not have permission to delete this comment');
            mockCommentsService.delete.mockRejectedValue(error);

            await expect(controller.delete(commentId)).rejects.toThrow(
                'Forbidden: You do not have permission to delete this comment',
            );
            expect(commentsService.delete).toHaveBeenCalledWith(commentId);
        });

        it('should return void on successful deletion', async () => {
            const commentId = 456;

            mockCommentsService.delete.mockResolvedValue(undefined);

            const result = await controller.delete(commentId);

            expect(commentsService.delete).toHaveBeenCalledWith(commentId);
            expect(result).toBeUndefined();
        });
    });
});
