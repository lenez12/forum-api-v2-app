const AddedThread = require('../../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../../Domains/threads/entities/AddThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const fakeUserId = 'user-123';
    const useCasePayload = {
      title: 'title',
      body: 'thread body',
    };
    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'title',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedThread({
        id: 'thread-123',
        title: 'title',
        owner: 'user-123',
      })));

    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await getThreadUseCase.execute(fakeUserId, useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);

    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: fakeUserId,
      }),
    );
  });
});
