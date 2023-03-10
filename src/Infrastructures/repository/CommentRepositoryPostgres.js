const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { threadId, content, owner } = addComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments (id, thread_id, content, owner) VALUES($1, $2, $3, $4) RETURNING id, thread_id, content, owner',
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);

    const mapToData = (item) => ({
      ...item,
      threadId: item.thread_id,
    });

    return new AddedComment({ ...result.rows.map(mapToData)[0] });
  }

  async verifyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError('anda tidak mempunyai akses ke resouce ini');
    }
  }

  async deleteComment(id) {
    const dateNow = new Date();
    const query = {
      text: 'UPDATE comments SET deleted_at=$1 WHERE id=$2',
      values: [dateNow, id],
    };

    await this._pool.query(query);
  }

  async getCommentsFromThread(threadId) {
    const query = {
      text: `SELECT comments.*, users.username FROM comments 
                LEFT JOIN users ON users.id = comments.owner 
                WHERE thread_id = $1 
                ORDER BY comments.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
