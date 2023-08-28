import request from 'sync-request';
import config from './config.json';

import { tokenId } from './auth';
import { typeChannel } from './dataStore';

let a1: tokenId;
let c1: typeChannel;
let timeFinish: number;

const ERROR400 = 400;
const ERROR403 = 403;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
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

function standUpActiveReq(token: string, channelId: number) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/standup/active/v1`,
      {
        qs: {
          channelId: channelId,
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

describe('Testing standUpActive', () => {
  test('Failed implementation: Invalid channelId', () => {
    const active = standUpActiveReq(a1.token, c1.channelId + 1);
    expect(active.statusCode).toBe(ERROR400);
  });

  test('Failed implementation: Invalid token', () => {
    const active = standUpActiveReq('Bonjour' + a1.token, c1.channelId);
    expect(active.statusCode).toBe(ERROR403);
  });

  test('Successful implementation: standUp is inactive', () => {
    const active = standUpActiveReq(a1.token, c1.channelId);
    expect(active.statusCode).toBe(200);
    expect(active.body).toStrictEqual({
      isActive: false,
      timeFinish: null,
    });
  });

  test('Successful implementation: standUp is active', () => {
    timeFinish = standUpStartReq(a1.token, c1.channelId, 5).body.timeFinish;
    const active = standUpActiveReq(a1.token, c1.channelId);
    expect(active.statusCode).toBe(200);
    expect(active.body).toStrictEqual({
      isActive: true,
      timeFinish: timeFinish,
    });
  });
});
