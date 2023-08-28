import { tokenId } from './auth';
import config from './config.json';
import request from 'sync-request';

const OK = 200;

let a1: tokenId;
let c: {body?: any, statusCode: any};

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  c = channelsCreateReq(a1.token, 'Channel Name', true);
});

afterEach(() => {
  clearv1();
});

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

describe('///// TESTING channelsCreateV1 /////', () => {
  test('Success -> Create 1 Channel', () => {
    expect(c.statusCode).toBe(OK);
    expect(c.body).toEqual({ channelId: expect.any(Number) });
  });

  test('Success -> Create Multiple Channels for 1 User', () => {
    channelsCreateReq(a1.token, 'Channel Name2', false);
    channelsCreateReq(a1.token, 'Channel Name3', false);
    expect(c.statusCode).toBe(OK);
    expect(c.body).toEqual({ channelId: expect.any(Number) });
  });

  test('Fail -> Invalid Token', () => {
    const bodyObj = channelsCreateReq('', 'Channel Name', true);
    expect(bodyObj.statusCode).toBe(403);
  });

  test('Fail -> Length of Channel Name <= 0', () => {
    const bodyObj = channelsCreateReq(a1.token, '', true);
    expect(bodyObj.statusCode).toBe(400);
  });
  test('Fail -> Length of Channel Name > 20', () => {
    const bodyObj = channelsCreateReq(a1.token, '123456789123456789123', true);
    expect(bodyObj.statusCode).toBe(400);
  });
});

export { channelsCreateReq };
