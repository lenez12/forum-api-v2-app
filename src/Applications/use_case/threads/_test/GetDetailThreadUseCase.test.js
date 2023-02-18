/* eslint-disable no-undef */

const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');

describe('GetDetailThreadUseCase', () => {
  /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
  it('should orchestrating the get detail a thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedGetThreadById = {
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2023-02-01T10:17:45.538Z',
      owner: 'user-123',
      username: 'jery',
    };

    const expectedGetCommentsFromThread = [
      {
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
        username: 'jery',
        thread: 'thread-wSKIx-KrKicyFmke_XiTo',
        created_at: '2023-02-01T10:17:45.538Z',
        deleted_at: '2023-02-02T10:17:45.538Z',
      },
      {
        id: 'comment-1',
        content: 'sebuah comment',
        owner: 'user-123',
        username: 'jery',
        thread: 'thread-sDqKxL7WmBRhBubZ5jrds',
        created_at: '2022-12-18 23:46:57.657136+07',
        deleted_at: null,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2023-02-01T10:17:45.538Z',
        owner: 'user-123',
        username: 'jery',
      }));

    mockCommentRepository.getCommentsFromThread = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          content: 'sebuah comment',
          owner: 'user-123',
          username: 'jery',
          thread: 'thread-wSKIx-KrKicyFmke_XiTo',
          created_at: '2023-02-01T10:17:45.538Z',
          deleted_at: '2023-02-02T10:17:45.538Z',
        },
        {
          id: 'comment-1',
          content: 'sebuah comment',
          owner: 'user-123',
          username: 'jery',
          thread: 'thread-sDqKxL7WmBRhBubZ5jrds',
          created_at: '2022-12-18 23:46:57.657136+07',
          deleted_at: null,
        },
      ]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(useCasePayload.threadId);

    // Assert
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsFromThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);

    expect(detailThread.id).toEqual(expectedGetThreadById.id);
    expect(detailThread.title).toEqual(expectedGetThreadById.title);
    expect(detailThread.body).toEqual(expectedGetThreadById.body);
    expect(detailThread.date).toEqual(expectedGetThreadById.date);
    expect(detailThread.username).toEqual(expectedGetThreadById.username);

    expect(detailThread.comments).toStrictEqual([
      {
        id: expectedGetCommentsFromThread[0].id,
        username: expectedGetCommentsFromThread[0].username,
        date: expectedGetCommentsFromThread[0].created_at,
        content: '**komentar telah dihapus**',
      },
      {
        id: expectedGetCommentsFromThread[1].id,
        username: expectedGetCommentsFromThread[1].username,
        date: expectedGetCommentsFromThread[1].created_at,
        content: expectedGetCommentsFromThread[1].content,
      },
    ]);
  });
});
