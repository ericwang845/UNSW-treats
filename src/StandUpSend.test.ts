import request from 'sync-request';
import config from './config.json';

import { tokenId } from './auth';
import { typeChannel } from './dataStore';

let a1: tokenId, a2: tokenId;
let c1: typeChannel;

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

function standUpSendReq(token: string, channelId: number, message: string) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/standup/send/v1`,
      {
        json: {
          channelId: channelId,
          message: message,
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
    standUpStartReq(a1.token, c1.channelId, 1);
    const sendMessage = standUpSendReq(a1.token, c1.channelId + 1, 'alexander');
    expect(sendMessage.statusCode).toBe(ERROR400);
  });

  test('Failed implementation: No active standup', () => {
    const sendMessage = standUpSendReq(a1.token, c1.channelId, 'alexander');
    expect(sendMessage.statusCode).toBe(ERROR400);
  });

  test('Failed implementation: Invalid token', () => {
    standUpStartReq(a1.token, c1.channelId, 1);
    const sendMessage = standUpSendReq('hehe' + a1.token, c1.channelId, 'alexander');
    expect(sendMessage.statusCode).toBe(ERROR403);
  });

  test('Failed implementation: Empty message', () => {
    standUpStartReq(a1.token, c1.channelId, 1);
    const sendMessage = standUpSendReq(a1.token, c1.channelId, '');
    expect(sendMessage.statusCode).toBe(ERROR400);
  });

  test('Failed implementation: Message exceeding 1000 characters', () => {
    standUpStartReq(a1.token, c1.channelId, 1);
    const sentence = 'I LOVE COMP1531 I LOVE COMP1531 I LOVE COMP1531 WOOHOO';
    let longMessage = '';
    for (let i = 0; i < 20; i++) {
      longMessage += sentence + '\n';
    }
    const sendMessage = standUpSendReq('hehe' + a1.token, c1.channelId, longMessage);
    expect(sendMessage.statusCode).toBe(400);
  });

  test('Failed implementation: Valid user but not part of the channel', () => {
    a2 = authRegister('alex.smith@gmail.com', 'hunter2', 'Alex', 'Smith').body;
    standUpStartReq(a1.token, c1.channelId, 1);
    const sendMessage = standUpSendReq(a2.token, c1.channelId, 'alexander');
    expect(sendMessage.statusCode).toBe(ERROR403);
  });

  test('Successful implementation: One message is sent', async() => {
    standUpStartReq(a1.token, c1.channelId, 1);
    const sendMessage = standUpSendReq(a1.token, c1.channelId, 'alexander');
    expect(sendMessage.statusCode).toBe(200);
    await new Promise((r) => setTimeout(r, 1100));
  });
});
