import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const AUTH_ERROR = 403;

let a1: tokenId;
let a2: tokenId;
let c: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  c = channelsCreateReq(a1.token, 'Channel Name', true).body.channelId;
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

function messageSendReq(token: string, channelId: number, message: string) {
  try {
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
  } catch (err) {
    return { statusCode: err.statusCode };
  }
}

describe('///// TESTING MESSAGESEND /////', () => {
  test('Success -> Message is Sent', () => {
    const a = messageSendReq(a1.token, c, 'Its a big building with patients, but thats not important right now.');
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Fail -> Invalid Token', () => {
    const a = messageSendReq('', c, 'Looks like I picked the wrong week to quit sniffing glue.');
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Invalid ChannelId', () => {
    const a = messageSendReq(a1.token, -1, 'Joey, have you ever been in a... in a Turkish prison?');
    expect(a.statusCode).toBe(ERROR);
  });
  test('Fail -> Message Length < 1', () => {
    const a = messageSendReq(a1.token, c, '');
    expect(a.statusCode).toBe(ERROR);
  });
  test('Fail -> Message Length > 1000', () => {
    const mes = 'I just want to tell you both good luck. Were all counting on you.';
    const a = messageSendReq(a1.token, c, mes.repeat(20));
    expect(a.statusCode).toBe(ERROR);
  });
  test('Fail -> AuthUser is not a member of the Channel', () => {
    const a = messageSendReq(a2.token, c, 'Jim never has a second cup of coffee at home.');
    expect(a.statusCode).toBe(AUTH_ERROR);
  });
});
