import request from 'sync-request';

import config from './config.json';
import { tokenId } from './auth';

const OK = 200;
const port = config.port;
const url = config.url;

let user1: tokenId;

function clearv1() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {}
  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

beforeEach(() => {
  clearv1();
  user1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  channelsCreateReq(user1.token, 'Channel One', true);
});

afterEach(() => {
  clearv1();
});

function authRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      },
    }
  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

function channelsCreateReq(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${config.url}:${config.port}/channels/create/v3`,
    {
      json: {
        name: name,
        isPublic: isPublic
      },
      headers: {
        token: token,
      }
    });
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

function channelsListReq(token: string) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/channels/list/v3`,
      {
        headers: {
          token: token
        }
      }
    );
    return {
      body: JSON.parse(res.getBody() as string),
      statusCode: res.statusCode,
    };
  } catch (err) {
    return { statusCode: err.statusCode };
  }
}

describe('TESTING channelsListV1', () => {
  test('Invalid token', () => {
    const bodyObj = channelsListReq('WhatTokenIsThis');
    expect(bodyObj.statusCode).toBe(403);
  });

  test('Single user with single channel', () => {
    const bodyObj = channelsListReq(user1.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel One',
          },
        ]
      });
  });

  test('Single user with two channels', () => {
    channelsCreateReq(user1.token, 'Channel Two', true);
    const bodyObj = channelsListReq(user1.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel One',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Two',
          }
        ]
      });
  });

  test('Single user with two channels', () => {
    channelsCreateReq(user1.token, 'Channel Two', true);
    const bodyObj = channelsListReq(user1.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel One',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Two',
          }
        ]
      });
  });

  test('Single user with multiple channels', () => {
    channelsCreateReq(user1.token, 'Channel Two', true);
    channelsCreateReq(user1.token, 'Channel Three', false);
    const bodyObj = channelsListReq(user1.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel One',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Two',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Three',
          }
        ]
      });
  });

  test('Two users but only one user is specified', () => {
    const user2 = authRegister('alexTheGreat@gmail.com', 'zero21', 'John', 'Smith').body;
    channelsCreateReq(user2.token, 'Channel Two', true);
    const bodyObj = channelsListReq(user1.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel One',
          }
        ]
      });
  });

  test('Second user with no channels', () => {
    const user2 = authRegister('alexTheGreat@gmail.com', 'zero21', 'John', 'Smith').body;
    const bodyObj = channelsListReq(user2.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual(
      {
        channels: []
      });
  });
});
