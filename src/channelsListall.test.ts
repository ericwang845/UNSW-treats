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

function channelsListallReq(token: string) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/channels/listall/v3`,
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
      }
  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

describe('TESTING channelsListallV2', () => {
  test('Invalid token', () => {
    const bodyObj = channelsListallReq('WhatTokenIsThis');
    expect(bodyObj.statusCode).toBe(403);
  });

  test('Single user with single channel', () => {
    const bodyObj = channelsListallReq(user1.token);
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

  test('Second user with no channels', () => {
    const user2 = authRegister('eren.jaeger@gmail.com', 'titaniumLevi', 'eren', 'jaeger').body;
    const bodyObj = channelsListallReq(user2.token);
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

  test('Single user with single channel', () => {
    const user2 = authRegister('eren.jaeger@gmail.com', 'titaniumLevi', 'eren', 'jaeger').body;
    const bodyObj = channelsListallReq(user2.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toStrictEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel One',
          },
        ]
      });
  });

  test('Single user with both public and private channels', () => {
    channelsCreateReq(user1.token, 'Channel Two', true);
    channelsCreateReq(user1.token, 'Channel Three', false);
    channelsCreateReq(user1.token, 'Channel Four', false);
    const bodyObj = channelsListallReq(user1.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toStrictEqual(
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
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Four',
          },
        ]
      });
  });

  test('Multiple users each with their own channels', () => {
    const robotAir = authRegister('robot.air@gmail.com', 'hunter1', 'robot', 'air').body;
    const robotWater = authRegister('robot.water@gmail.com', 'hunter2', 'robot', 'water').body;
    const robotStone = authRegister('robot.stone@gmail.com', 'hunter3', 'robot', 'stone').body;
    const robotFire = authRegister('robot.fire@gmail.com', 'hunter4', 'robot', 'fire').body;
    channelsCreateReq(robotAir.token, 'Channel 1', true);
    channelsCreateReq(robotWater.token, 'Channel 2', true);
    channelsCreateReq(robotFire.token, 'Channel 3', false);
    channelsCreateReq(robotStone.token, 'Channel 4', true);
    channelsCreateReq(robotStone.token, 'Channel 5', false);

    const bodyObj = channelsListallReq(robotFire.token);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toStrictEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel One',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel 1',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel 2',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel 3',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel 4',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel 5',
          },
        ]
      });
  });
});
