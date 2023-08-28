import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let c: number;
let m: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  c = channelsCreateReq(a1.token, 'Channel Name', true).body.channelId;
  m = messageSendReq(a1.token, c, 'lol').body.messageId;
});

afterEach(() => {
  clearv1();
});

function messageSendReq(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
      `${config.url}:${config.port}/message/send/v2`,
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
}

// Wrapper function to send register http request
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

// Wrapper function to send clear http request
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

function messageEditReq(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
  `${config.url}:${config.port}/message/edit/v2`,
  {
    json: {
      messageId: messageId,
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
}

function messageRemoveReq(token: string, messageId: number) {
  const res = request(
    'DELETE',
    `${config.url}:${config.port}/message/remove/v2`,
    {
      qs: {
        messageId: messageId,
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

function channelMessagesReq(token:string, channelId: number, start: number) {
  try {
    const res = request(
      'GET',
          `${config.url}:${config.port}/channel/messages/v3`,
          {
            qs: {
              channelId: channelId,
              start: start,
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

describe('///// TESTING CHANNEL MESSAGES /////', () => {
  test('Success -> Return 1 Message from Index 0', () => {
    const a = channelMessagesReq(a1.token, c, 0);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: [{
        messageId: expect.any(Number),
        uId: expect.any(Number),
        message: 'lol',
        timeSent: expect.any(Number),
        reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }],
        isPinned: false,
      }],
      start: 0,
      end: -1
    });
    messageEditReq(a1.token, m, 'crazy');
  });
  test('Success -> No Messages in Channel', () => {
    const d = channelsCreateReq(a1.token, 'lol', true).body.channelId;
    const a = channelMessagesReq(a1.token, d, 0);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });
  test('Success -> Returns 2 Messages from Index 0', () => {
    for (let i = 0; i < 2; i++) {
      messageSendReq(a1.token, c, 'lol');
    }
    const a = channelMessagesReq(a1.token, c, 0);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: [{ messageId: expect.any(Number), uId: a1.authUserId, message: 'lol', timeSent: expect.any(Number), reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }], isPinned: false },
        { messageId: expect.any(Number), uId: a1.authUserId, message: 'lol', timeSent: expect.any(Number), reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }], isPinned: false },
        { messageId: expect.any(Number), uId: a1.authUserId, message: 'lol', timeSent: expect.any(Number), reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }], isPinned: false }],
      start: 0,
      end: -1,
    });
  });

  test('Success -> Returns 51 Messages from Index 0', () => {
    for (let i = 0; i < 50; i++) {
      messageSendReq(a1.token, c, 'loool');
    }
    const a = channelMessagesReq(a1.token, c, 0);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
  });
  test('Success -> Returns 101 Messages from Index 50', () => {
    for (let i = 0; i < 100; i++) {
      messageSendReq(a1.token, c, 'loool');
    }
    const a = channelMessagesReq(a1.token, c, 50);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: expect.any(Array),
      start: 50,
      end: 100,
    });
  });
  test('Success -> Returns 100 Messages from index 50, End == -1', () => {
    for (let i = 0; i < 99; i++) {
      messageSendReq(a1.token, c, 'loool');
    }
    const a = channelMessagesReq(a1.token, c, 50);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });
  });
  test('Fail -> Invalid Token', () => {
    const a = channelMessagesReq('', c, 99);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Start Index greater than no of Messages in Channel', () => {
    const a = channelMessagesReq(a1.token, c, 99);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> Start Index is greater than total no of Messages in Channel, Messages in Channel are Empty', () => {
    messageRemoveReq(a1.token, m);
    const a = channelMessagesReq(a1.token, c, 99);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> Invalid ChannelId', () => {
    const a = channelMessagesReq(a1.token, -1, 99);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser not a member of Channel', () => {
    const a = channelMessagesReq(a2.token, c, 0);
    expect(a.statusCode).toBe(403);
  });
});
