import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let d: number;
let dm1: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
  d = DMCreateReq(a1.token, [a2.authUserId]).body.dmId;
  dm1 = postMessageSendDmV1(a1.token, d, 'lol').body.messageId;
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

function postMessageSendDmV1(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
      `${config.url}:${config.port}` + '/message/senddm/v2',
      {
        json: {
          dmId: dmId,
          message: message,
        },
        headers: {
          token: token,
        }
      }
  );
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

function DMMessagesReq(token: string, dmId: number, start: number) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/dm/messages/v2`,
      {
        qs: {
          dmId: dmId,
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

describe('///// TESTING DMMESSAGES //////', () => {
  test('Success -> Return 1 Message from Index 0', () => {
    const a = DMMessagesReq(a1.token, d, 0);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: [
        { messageId: expect.any(Number), uId: a1.authUserId, message: 'lol', timeSent: expect.any(Number), reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }], isPinned: false }
      ],
      start: 0,
      end: -1,
    });
  });
  test('Success -> Return 0 Messages from Index 0', () => {
    messageRemoveReq(a1.token, dm1);
    const a = DMMessagesReq(a1.token, d, 0);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
  test('Success -> Return 2 Messages from Index 0', () => {
    for (let i = 0; i < 2; i++) {
      postMessageSendDmV1(a1.token, d, 'lol');
    }
    const a = DMMessagesReq(a1.token, d, 0);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: [{ messageId: expect.any(Number), uId: a1.authUserId, message: 'lol', timeSent: expect.any(Number), reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }], isPinned: false },
        { messageId: expect.any(Number), uId: a1.authUserId, message: 'lol', timeSent: expect.any(Number), reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }], isPinned: false },
        { messageId: expect.any(Number), uId: a1.authUserId, message: 'lol', timeSent: expect.any(Number), reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }], isPinned: false }],
      start: 0,
      end: -1,
    });
  });
  test('Success -> Return 51 Messages from Index 0', () => {
    for (let i = 0; i < 50; i++) {
      postMessageSendDmV1(a1.token, d, 'loool');
    }
    const a = DMMessagesReq(a1.token, d, 0);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
  });
  test('Success -> Return 101 Messages from Index 50', () => {
    for (let i = 0; i < 100; i++) {
      postMessageSendDmV1(a1.token, d, 'loool');
    }
    const a = DMMessagesReq(a1.token, d, 50);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: expect.any(Array),
      start: 50,
      end: 100,
    });
  });
  test('Success -> Return 100 Messages from Index 50, End == -1', () => {
    for (let i = 0; i < 99; i++) {
      postMessageSendDmV1(a1.token, d, 'loool');
    }
    const a = DMMessagesReq(a1.token, d, 50);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });
  });

  test('Fail -> Invalid Token', () => {
    const a = DMMessagesReq('', d, 0);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Invalid DmId', () => {
    const a = DMMessagesReq(a1.token, -1, 0);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser not a member of DM', () => {
    const a = DMMessagesReq(a3.token, d, 0);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Start Index is greater than total no of Messages in DM', () => {
    const a = DMMessagesReq(a1.token, d, 99);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> Start Index is greater than total no of Messages in DM, Messages in DM are Empty', () => {
    messageRemoveReq(a1.token, dm1);
    const a = DMMessagesReq(a1.token, d, 99);
    expect(a.statusCode).toBe(400);
  });
});
