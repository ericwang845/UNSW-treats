import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const AUTH_ERROR = 403;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let c1: number;
let c2: number;
let c3: number;
let d1: number;
let d2: number;
let d3: number;
let m1: number;
let dm1: number;
let dm2: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
  c1 = channelsCreateReq(a1.token, 'lol', true).body.channelId;
  postChannelInviteV2(a1.token, c1, a2.authUserId);
  c2 = channelsCreateReq(a2.token, 'lol', true).body.channelId;
  postChannelInviteV2(a2.token, c2, a1.authUserId);
  c3 = channelsCreateReq(a3.token, 'lol', true).body.channelId;
  // c1 Members: a1, a2
  // c2 Members: a2, a1
  // c3 Members: a3
  d1 = DMCreateReq(a1.token, [a2.authUserId]).body.dmId;
  d2 = DMCreateReq(a2.token, [a1.authUserId]).body.dmId;
  d3 = DMCreateReq(a3.token, []).body.dmId;
  // d1 Members: a1, a2,
  // d2 Members: a2, a1
  // d3 Members: a3
  m1 = messageSendReq(a1.token, c1, 'lol').body.messageId;
  dm1 = postMessageSendDmV1(a1.token, d1, 'lol').body.messageId;
  dm2 = postMessageSendDmV1(a2.token, d2, 'lol').body.messageId;
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

function messageShareReq(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/message/share/v1`,
      {
        json: {
          ogMessageId: ogMessageId,
          message: message,
          channelId: channelId,
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

describe('///// TESTING MESSAGESHAREV1 /////', () => {
  test('Success -> Channel Message Shared to Channel, No Optional Message', () => {
    const s = messageShareReq(a1.token, m1, '', c2, -1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Success -> DM Message Shared to DM, No Optional Message', () => {
    const s = messageShareReq(a1.token, dm1, '', -1, d2);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Success -> Channel Message Shared to DM, No Optional Message', () => {
    const s = messageShareReq(a1.token, m1, '', -1, d2);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Success -> DM Message Shared to Channel, No Optional Message', () => {
    const s = messageShareReq(a1.token, dm1, '', c2, -1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Success -> Channel Message Shared to Channel, Optional Message', () => {
    const s = messageShareReq(a1.token, m1, 'das crazy das insane das rad das sick das wicked', c2, -1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Success -> DM Message Shared to DM, Optional Message', () => {
    const s = messageShareReq(a1.token, dm1, 'das crazy das insane das rad das sick das wicked', -1, d2);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Success -> Channel Message Shared to DM, Optional Message', () => {
    const s = messageShareReq(a1.token, m1, 'das crazy das insane das rad das sick das wicked', -1, d2);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Success -> DM Message Shared to Channel, Optional Message', () => {
    const s = messageShareReq(a1.token, m1, 'das crazy das insane das rad das sick das wicked', c2, -1);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Fail -> DM where MessageId exists is removed ', () => {
    DMRemoveReq(a1.token, d1);
    const s = messageShareReq(a1.token, dm1, '', -1, d2);
    expect(s.statusCode).toBe(ERROR);
  });
  test('Fail -> Share Recipient is removed ', () => {
    DMRemoveReq(a1.token, d1);
    const s = messageShareReq(a1.token, dm2, '', -1, d1);
    expect(s.statusCode).toBe(ERROR);
  });
  test('Fail -> Message is Removed ', () => {
    messageRemoveReq(a1.token, m1);
    const s = messageShareReq(a1.token, m1, '', -1, d1);
    expect(s.statusCode).toBe(ERROR);
  });
  test('Fail -> Invalid Token', () => {
    const s = messageShareReq('', m1, '', c1, -1);
    expect(s.statusCode).toBe(AUTH_ERROR);
  });
  test('Fail -> Neither channelId or DmId are !== -1', () => {
    const s = messageShareReq(a1.token, m1, '', -1, -1);
    expect(s.statusCode).toBe(ERROR);
  });
  test('Fail -> Invalid ChannelId', () => {
    const s = messageShareReq(a1.token, m1, '', -99, -1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> Invalid DMId', () => {
    const s = messageShareReq(a1.token, m1, '', -99, -1);
    expect(s.statusCode).toBe(400);
  });
  test('Fail -> Neither ChannelId nor DMId === -1', () => {
    const s = messageShareReq(a1.token, m1, '', c1, d1);
    expect(s.statusCode).toBe(ERROR);
  });
  test('Fail -> MessageId does not Exist in Channels AuthUser has joined', () => {
    const s = messageShareReq(a3.token, m1, '', c3, -1);
    expect(s.statusCode).toBe(ERROR);
  });
  test('Fail -> MessageId does not Exist in DMs AuthUser has joined', () => {
    const s = messageShareReq(a3.token, dm1, '', -1, d3);
    expect(s.statusCode).toBe(ERROR);
  });
  test('Fail -> MessageLength > 1000', () => {
    let string = 'loll';
    string = string.repeat(251);
    const s = messageShareReq(a1.token, m1, string, c2, -1);
    expect(s.statusCode).toBe(ERROR);
  });
  test('Fail -> AuthUser has not joined Channel', () => {
    const s = messageShareReq(a1.token, m1, '', c3, -1);
    expect(s.statusCode).toBe(403);
  });
  test('Fail -> AuthUser has not joined DM', () => {
    const s = messageShareReq(a1.token, dm1, '', -1, d3);
    expect(s.statusCode).toBe(AUTH_ERROR);
  });
});
