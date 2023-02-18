/* eslint-disable class-methods-use-this */
class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      threadId,
      content,
      owner,
    } = payload;

    this.id = id;
    this.threadId = threadId;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({
    id, threadId, content, owner,
  }) {
    if (!id || !threadId || !content || !owner) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof threadId !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedComment;
