import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let d1: number;
let d2: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
  d1 = DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]).body.dmId;
  d2 = DMCreateReq(a2.token, [a3.authUserId]).body.dmId;
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

function DMCreateReq(token: string, uIds: Array<number>) {
  try {
    const res = request(
      'POST',
        `${config.url}:${config.port}/dm/create/v2`,
        {
          json: {
            uIds: uIds
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

function DMLeaveReq(token: string, dmId: number) {
  try {
    const res = request(
      'POST',
        `${config.url}:${config.port}/dm/leave/v2`,
        {
          json: {
            dmId: dmId,
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

function DMRemoveReq(token: string, dmId: number) {
  try {
    const res = request(
      'DELETE',
        `${config.url}:${config.port}/dm/remove/v2`,
        {
          qs: {
            dmId: dmId,
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

function messageSendLaterDmReq(token: string, dmId: number, message: string, timeSent: number) {
  try {
    const res = request(
      'POST',
        `${config.url}:${config.port}/message/sendlaterdm/v1`,
        {
          json: {
            dmId: dmId,
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

describe('///// TESTING MESSAGESENDLATERDM /////', () => {
  test('Success -> Message Set to Send after 0.001s', () => {
    const s = messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Success -> Message Set to Send after 0.001s', () => {
    const s = messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Success -> 3 Messages are set to Send Later', () => {
    messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    const s = messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Success -> DM is deleted before the Message is Set to Send', async () => {
    const s = messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 2000);
    DMRemoveReq(a1.token, d1);
    await new Promise((r) => setTimeout(r, 2000));
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ messageId: expect.any(Number) });
  });
  test('Fail -> Message Set to Send after 0.001s. AuthUser Leaves DM.', () => {
    DMLeaveReq(a1.token, d1);
    const s = messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(403);
  });
  test('Fail -> Message Set to Send after 0.001s. DM is Removed.', () => {
    DMRemoveReq(a1.token, d1);
    const s = messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> Invalid Token', () => {
    const s = messageSendLaterDmReq('', d1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(403);
  });
  test('Fail -> Invalid DMId', () => {
    const s = messageSendLaterDmReq(a1.token, -1, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> Length of Message < 1', () => {
    const s = messageSendLaterDmReq(a1.token, d1, '', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> Length of Message > 1000', () => {
    let string = 'loll';
    string = string.repeat(300);
    const s = messageSendLaterDmReq(a1.token, d1, string, Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> timeSent is in the Past', () => {
    const s = messageSendLaterDmReq(a1.token, d1, 'lol', Math.floor((new Date()).getTime() / 1000) + -1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> AuthUser not a Member of Channel', () => {
    const s = messageSendLaterDmReq(a1.token, d2, 'lol', Math.floor((new Date()).getTime() / 1000) + 1);
    expect(s.statusCode).toBe(403);
  });
});
