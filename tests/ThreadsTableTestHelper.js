const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThreads({
    id = 'threads-123', title = 'thread', body = 'thread body', owner = 'user-123',
  }) {
    const query = {
      text: `INSERT INTO threads (id, title, body, "owner")
            VALUES($1, $2, $3, $4) RETURNING id, title, owner`,
      values: [id, title, body, owner],
    };
    await pool.query(query);
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
