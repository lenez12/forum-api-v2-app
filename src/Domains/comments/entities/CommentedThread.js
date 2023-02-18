/* eslint-disable no-restricted-globals */
/* eslint-disable array-callback-return */
/* eslint-disable camelcase */
class CommentedThread {
  constructor(payload) {
    this.comments = this._mappingPayloadModel(payload);
  }

  _mappingPayloadModel(comments) {
    const dataModel = comments.map(({
      id,
      username,
      content,
      created_at,
      deleted_at,
    }) => {
      if (!id || !username || !content || !created_at) {
        throw new Error('COMMENTED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
      }
      if (
        typeof id !== 'string'
        || typeof username !== 'string'
        || typeof content !== 'string'
        || typeof created_at instanceof Date
      ) {
        throw new Error('COMMENTED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
      }
      return {
        id,
        username,
        date: created_at,
        content: deleted_at ? '**komentar telah dihapus**' : content,
      };
    });
    return dataModel;
  }
}

module.exports = CommentedThread;
