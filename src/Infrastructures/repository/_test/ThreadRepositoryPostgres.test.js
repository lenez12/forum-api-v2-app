const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'jery',
      password: 'secret',
      fullname: 'Jery Indonesia',
    });
  });
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange

      const fakeIdGenerator = () => '123';
      const payload = {
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      };
      const addThread = new AddThread(payload);
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepository.addThread(addThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const payload = {
        title: 'title',
        body: 'thread body',
        owner: 'user-123',
      };
      const addThread = new AddThread(payload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: addThread.title,
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadAvaibility function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});
      await expect(threadRepositoryPostgres.verifyThreadAvaibility('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread found', async () => {
      const thread = {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      };
      await ThreadsTableTestHelper.addThreads(thread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});
      await expect(threadRepositoryPostgres.verifyThreadAvaibility('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});
      await expect(threadRepositoryPostgres.getThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread data if exist', async () => {
      const thread = {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      };
      await ThreadsTableTestHelper.addThreads(thread);

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});
      const detailThread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(detailThread.id).toEqual(thread.id);
      expect(detailThread.title).toEqual(thread.title);
      expect(detailThread.body).toEqual(thread.body);
      expect(detailThread.owner).toEqual(thread.owner);
      expect(detailThread.date).toBeInstanceOf(Date);
      expect(detailThread.username).toEqual('jery'); // from username on BeforeEach
    });
  });
});
