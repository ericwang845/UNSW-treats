import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let c1: number;
let c2: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  c1 = channelsCreateReq(a1.token, 'lol', true).body.channelId;
  c2 = channelsCreateReq(a2.token, 'lol', true).body.channelId;
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

function channelLeaveReq(token:string, channelId: number) {
  try {
    const res = request(
      'POST',
        `${config.url}:${config.port}/channel/leave/v2`,
        {
          json: {
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

function postChannelJoinV2(token: string, channelId: number) {
  const res = request(
    'POST',
      `${config.url}:${config.port}` + '/channel/join/v3',
      {
        json: {
          channelId: channelId,
        },
        headers: {
          token: token,
        }
      }
  );
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

function postChannelInviteV2(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
        `${config.url}:${config.port}` + '/channel/invite/v3',
        {
          json: {
            channelId: channelId,
            uId: uId
          },
          headers: {
            token: token,
          }
        }
  );
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

function messageSendLaterReq(token: string, channelId: number, message: string, timeSent: number) {
  try {
    const res = request(
      'POST',
        `${config.url}:${config.port}/message/sendlater/v1`,
        {
          json: {
            channelId: channelId,
            message: message,
            timeSent: timeSent,
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

describe('///// TESTING MESSAGESENDLATER /////', () => {
  test('Success -> Message Set to Send after 0.001s', () => {
    const s = messageSendLaterReq(a1.token, c1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Success -> Message Set to Send after 0.001s', () => {
    const s = messageSendLaterReq(a1.token, c1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Success -> Message Set to Send after 0.001s. AuthUser is invited to Channel.', () => {
    postChannelInviteV2(a2.token, c2, a1.authUserId);
    const s = messageSendLaterReq(a1.token, c2, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Success -> Message Set to Send after 0.001s. AuthUser Joins Channel.', () => {
    postChannelJoinV2(a1.token, c2);
    const s = messageSendLaterReq(a1.token, c2, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Success -> 3 Messages are set to Send Later', () => {
    messageSendLaterReq(a1.token, c1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    messageSendLaterReq(a1.token, c1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    const s = messageSendLaterReq(a1.token, c1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Fail -> AuthUser leaves Channel before Function Call', () => {
    channelLeaveReq(a1.token, c1);
    const s = messageSendLaterReq(a1.token, c1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(403);
  });
  test('Fail -> Invalid Token', () => {
    const s = messageSendLaterReq('', c1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(403);
  });
  test('Fail -> Invalid ChannelId', () => {
    const s = messageSendLaterReq(a1.token, -1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> Length of Message < 1', () => {
    const s = messageSendLaterReq(a1.token, c1, '', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> Length of Message > 1000', () => {
    let string = 'loll';
    string = string.repeat(300);
    const s = messageSendLaterReq(a1.token, c1, string, Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> timeSent is in the Past', () => {
    const s = messageSendLaterReq(a1.token, c1, 'lol', Math.floor((new Date()).getTime() / 1000) + -1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> AuthUser not a Member of Channel', () => {
    const s = messageSendLaterReq(a2.token, c1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(403);
  });
});
