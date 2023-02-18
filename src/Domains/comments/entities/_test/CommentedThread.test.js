/* eslint-disable no-undef */

const CommentedThread = require('../CommentedThread');

describe('a CommentedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = [
      {
        id: 'comment-123',
        content: 'sebuah comment',
        created_at: '12-12-2012 12:12',
        delete_at: '12-01-2012 12:12',
      },
    ];

    // Action and Assert
    expect(() => new CommentedThread(payload)).toThrowError('COMMENTED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = [
      {
        id: 'comment-123',
        content: 'sebuah comment',
        username: 123,
        created_at: '12-12-2012 12:12',
        deleted_at: '12-01-2012 12:12',
      },
    ];
      // Action and Assert
    expect(() => new CommentedThread(payload)).toThrowError('COMMENTED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create format commented thread valid object correctly', () => {
    const payload = [
      {
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
        username: 'jery',
        created_at: '12-12-2012 12:12',
        deleted_at: '',
      },
      {
        id: 'comment-234',
        content: 'sebuah comment',
        owner: 'user-123',
        username: 'jery',
        created_at: '12-12-2012 12:12',
        deleted_at: '12-01-2012 12:12',
      },
    ];
    const commentedThread = new CommentedThread(payload);
    expect(commentedThread.comments).toStrictEqual([
      {
        id: payload[0].id,
        username: payload[0].username,
        date: payload[0].created_at,
        content: payload[0].content,
      },
      {
        id: payload[1].id,
        username: payload[1].username,
        date: payload[1].created_at,
        content: '**komentar telah dihapus**',
      },
    ]);
  });
});
