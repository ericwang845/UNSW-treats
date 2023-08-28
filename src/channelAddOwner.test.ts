import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let c: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
  c = channelsCreateReq(a1.token, 'Channel Name', true).body.channelId;
});

afterEach(() => {
  clearv1();
});

function channelInviteReq(token: string, channelId: number, uId: number) {
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

function addOwnerReq(token: string, channelId: number, uId: number) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/channel/addowner/v2`,
      {
        json: {
          channelId: channelId,
          uId: uId
        },
        headers: {
          token: token,
        },
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

describe('///// TESTING ADDOWNER /////', () => {
  test('Success -> Add 1 Channel Owner', () => {
    channelInviteReq(a1.token, c, a2.authUserId);
    const a = addOwnerReq(a1.token, c, a2.authUserId);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({});
  });
  test('Fail -> Invalid Token', () => {
    const a = addOwnerReq('', c, a2.authUserId);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Invalid ChannelId', () => {
    const a = addOwnerReq(a1.token, -1, a2.authUserId);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> Invalid UserId', () => {
    const a = addOwnerReq(a1.token, c, -1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> UserId not a member of Channel', () => {
    const a = addOwnerReq(a1.token, c, a3.authUserId);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> UserId is already an Owner', () => {
    addOwnerReq(a1.token, c, a1.authUserId);
    const a = addOwnerReq(a1.token, c, a2.authUserId);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser is not an Owner of Channel', () => {
    const a = addOwnerReq(a2.token, c, a2.authUserId);
    expect(a.statusCode).toBe(403);
  });
});
