/* eslint-disable no-undef */

const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

let server = null;
let threadId = null;
let user1AccessToken = null;
let commentId = null;
let user2AccessToken = null;

describe('/comments endpoint', () => {
  beforeAll(async () => {
    server = await createServer(container);
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'jery',
        password: 'secret',
        fullname: 'Jery Lenas',
      },
    });
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'jerysecond',
        password: 'secret',
        fullname: 'Jery Lenas Second',
      },
    });

    const loginResponse1 = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'jery',
        password: 'secret',
      },
    });
    const loginResponse2 = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'jerysecond',
        password: 'secret',
      },
    });

    const jsonUser1 = JSON.parse(loginResponse1.payload);
    user1AccessToken = jsonUser1.data.accessToken;
    const jsonUser2 = JSON.parse(loginResponse2.payload);
    user2AccessToken = jsonUser2.data.accessToken;

    const reponseThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'thread abc',
        body: 'thread abc ...',
      },
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
    });

    const { data: { addedThread } } = JSON.parse(reponseThread.payload);

    threadId = addedThread.id;
  });
  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /comments', () => {
    it('should response 201 and new comments', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'text comment...',
        },
        headers: {
          authorization: `Bearer ${user1AccessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      commentId = responseJson.data.addedComment.id;
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 403 when owner unauthorized', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${user2AccessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when comment not found', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-0`,
        headers: {
          authorization: `Bearer ${user1AccessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 200 when deleted comment', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${user1AccessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
