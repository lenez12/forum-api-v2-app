/* eslint-disable no-undef */

const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'jery',
      password: 'secret',
      fullname: 'Jery Indonesia',
    });
    await ThreadsTableTestHelper.addThreads({
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      const addComment = new AddComment({
        content: 'text comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const addComment = new AddComment({
        content: 'text comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: addComment.content,
        threadId: addComment.threadId,
        owner: addComment.owner,
      }));
    });
  });

  describe('verifyOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      await expect(commentRepositoryPostgres
        .verifyOwner('comment-0', 'user-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner unauthorized', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'text comment',
        thread: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      await expect(commentRepositoryPostgres.verifyOwner('comment-123', 'other-user'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when owner authorized', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'text comment',
        thread: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      await expect(commentRepositoryPostgres.verifyOwner('comment-1', 'user-123'))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should update deleted_at column with date now to deleted comment', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'text comment',
        thread: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});
      await commentRepositoryPostgres.deleteComment('comment-123');

      const deletedComment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(deletedComment[0].deleted_at).not.toBeNull();
    });
  });

  describe('getCommentsFromThread function', () => {
    it('should get all comment with given thread id', async () => {
      const payload = {
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
        thread_id: 'thread-123',
        created_at: new Date(),
      };

      CommentsTableTestHelper.addComment(payload);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});
      const detailThread = await commentRepositoryPostgres.getCommentsFromThread('thread-123');

      expect(detailThread).toHaveLength(1);
      expect(detailThread[0].id).toStrictEqual(payload.id);
      expect(detailThread[0].content).toStrictEqual(payload.content);
      expect(detailThread[0].owner).toStrictEqual(payload.owner);
      expect(detailThread[0].thread_id).toStrictEqual(payload.thread_id);
      expect(detailThread[0].created_at).toStrictEqual(payload.created_at);
      expect(detailThread[0].username).toStrictEqual('jery'); // from username on BeforeEach
      expect(detailThread[0].deleted_at).toStrictEqual(null);
    });
  });
});
