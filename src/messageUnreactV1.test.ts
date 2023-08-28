import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let a4: tokenId;
let c1: number;
let d1: number;
let m1: number;
let dm1: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
  a4 = authRegister('lmao.smith@gmail.com', 'hunter2', 'Lmao', 'Smith').body;
  c1 = channelsCreateReq(a1.token, 'lol', true).body.channelId;
  d1 = DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]).body.dmId;
  m1 = messageSendReq(a1.token, c1, 'lol').body.messageId;
  dm1 = postMessageSendDm(a1.token, d1, 'lol').body.messageId;
  messageReactReq(a1.token, m1, 1);
  messageReactReq(a1.token, dm1, 1);
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

function postMessageSendDm(token: string, dmId: number, message: string) {
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
  if (res.statusCode !== OK) {
    return {
      statusCode: res.statusCode,
    };
  } else {
    return {
      body: JSON.parse(res.getBody() as string),
      statusCode: res.statusCode,
    };
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

function messageReactReq(token: string, messageId: number, reactId: number) {
  try {
    const res = request(
      'POST',
          `${config.url}:${config.port}/message/react/v1`,
          {
            json: {
              messageId: messageId,
              reactId: reactId
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

function messageUnreactReq(token: string, messageId: number, reactId: number) {
  try {
    const res = request(
      'POST',
            `${config.url}:${config.port}/message/unreact/v1`,
            {
              json: {
                messageId: messageId,
                reactId: reactId
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

describe('///// TESTING MESSAGEUNREACT /////', () => {
  test('Success -> AuthUser Unreacts Channel Message', () => {
    const a = messageUnreactReq(a1.token, m1, 1);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({});
  });
  test('Success -> AuthUser Unreacts DM Message', () => {
    const a = messageUnreactReq(a1.token, dm1, 1);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({});
  });
  test('Fail -> Invalid Token', () => {
    const a = messageUnreactReq('', m1, 1);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Invalid messageId', () => {
    const a = messageUnreactReq(a1.token, -1, 1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser leaves Channel where Message exists', () => {
    channelLeaveReq(a1.token, c1);
    const a = messageUnreactReq(a1.token, m1, 1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser leaves DM where Message exists', () => {
    DMLeaveReq(a2.token, c1);
    const a = messageUnreactReq(a2.token, dm1, 1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> Message is removed before Unreact', () => {
    messageRemoveReq(a1.token, m1);
    const a = messageUnreactReq(a1.token, m1, 1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> DM is removed before Unreact', () => {
    DMRemoveReq(a1.token, d1);
    const a = messageUnreactReq(a1.token, dm1, 1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser has not joined Channel MessageId exists in', () => {
    const a = messageUnreactReq(a3.token, m1, 1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser has not joined DM MessageId exists in', () => {
    const a = messageUnreactReq(a4.token, dm1, 1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> Invalid ReactId ', () => {
    const a = messageUnreactReq(a1.token, dm1, 2);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser has already Unreacted', () => {
    messageUnreactReq(a1.token, m1, 1);
    const a = messageUnreactReq(a1.token, m1, 1);
    expect(a.statusCode).toBe(400);
  });
});
