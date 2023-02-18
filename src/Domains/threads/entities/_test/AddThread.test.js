const AddThread = require('../AddThread');

describe('a Add Thread entities', () => {
  it('should throw error when payload did not contain need property', () => {
    // Arrange
    const payload = {
      title: 'thread title',
      owner: 'user-123',
    };
    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: true,
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 50 character', () => {
    // Arrange
    const payload = {
      title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,',
      body: 'thread body',
      owner: 'user-123',
    };
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.TITLE_HAVE_LIMIT_CHAR');
  });

  it('should create thread object correctly', () => {
    // Arrange
    const payload = {
      title: 'thread title',
      body: 'thread body',
      owner: 'user-123',
    };
    const { title, body, owner } = new AddThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
