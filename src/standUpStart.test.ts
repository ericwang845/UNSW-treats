import request from 'sync-request';
import config from './config.json';

import { tokenId } from './auth';
import { typeChannel } from './dataStore';

let a1: tokenId;
let a2: tokenId;
let c1: typeChannel;

const ERROR400 = 400;
const ERROR403 = 403;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('alex.smith@gmail.com', 'hunter20', 'Alex', 'Smith').body;
  c1 = channelsCreateReq(a1.token, 'Channel Name', true).body;
});

afterEach(() => {
  clearv1();
});

function authRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${config.url}:${config.port}/auth/register/v3`,
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
  try {
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

function clearv1() {
  const res = request(
    'DELETE',
    `${config.url}:${config.port}/clear/v1`,
    {}
  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

function standUpStartReq(token: string, channelId: number, length: number) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/standup/start/v1`,
      {
        json: {
          channelId: channelId,
          length: length
        },
        headers: {
          token: token,
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

describe('Testing standUpStart', () => {
  test('Failed implementation: Invalid token', () => {
    const standUp = standUpStartReq('WhatTokenIsThis', 1, 10);
    expect(standUp.statusCode).toBe(ERROR403);
  });

  test('Failed implementation: Invalid channelId', () => {
    const standUp = standUpStartReq(a1.token, 10, 10);
    expect(standUp.statusCode).toBe(ERROR400);
  });

  test('Failed implementation: Negative time length', () => {
    const standUp = standUpStartReq(a1.token, 1, -2);
    expect(standUp.statusCode).toBe(ERROR400);
  });

  test('Failed implementation: Invalid token is not part of the channel', () => {
    const standUp = standUpStartReq('Bonjour' + a1.token, 1, -2);
    expect(standUp.statusCode).toBe(ERROR400);
  });

  test('Failed implementation: Valid user is not part of the channel', () => {
    standUpStartReq(a2.token, c1.channelId, 1);
    const standUp2 = standUpStartReq(a2.token, c1.channelId, 1);
    expect(standUp2.statusCode).toBe(ERROR403);
  });

  test('Failed implementation: Another standup is already running', () => {
    standUpStartReq(a1.token, c1.channelId, 1);
    const standUp2 = standUpStartReq(a1.token, c1.channelId, 1);
    expect(standUp2.statusCode).toBe(ERROR400);
  });

  test('Successful implementation: Created 1 standUp', () => {
    const standUp = standUpStartReq(a1.token, c1.channelId, 1);
    expect(standUp.statusCode).toBe(200);
    expect(standUp.body).toStrictEqual({
      timeFinish: expect.any(Number),
    });
  });
});
