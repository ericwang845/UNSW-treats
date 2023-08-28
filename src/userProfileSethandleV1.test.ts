import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const AUTH_ERROR = 403;
const port = config.port;
const url = config.url;

/*
Iteration 2
*/

function postAuthRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
        `${url}:${port}` + '/auth/register/v3',
        {
          json: {
            email: email,
            password: password,
            nameFirst: nameFirst,
            nameLast: nameLast,
          }
        }
  );
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

function putUserProfileSethandleV1(token: string, handleStr: string) {
  const res = request(
    'PUT',
        `${url}:${port}` + '/user/profile/sethandle/v2',
        {
          json: {
            handleStr: handleStr,
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

function clear() {
  const res = request(
    'DELETE',
      `${url}:${port}` + '/clear/v1',
      {}
  );
  return JSON.parse(res.getBody() as string);
}

beforeEach(() => {
  clear();
});

afterEach(() => {
  clear();
});

describe('Testing /user/profile/sethandle/v1:', () => {
  test('/user/profile/sethandle/v1: token is not valid', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newHandle = putUserProfileSethandleV1(newUser1.body.token + 1, 'mynemjeff');
    expect(newHandle.statusCode).toBe(AUTH_ERROR);
  });

  test('/user/profile/sethandle/v1: length of handleStr is not between 3 and 20 characters inclusive, too short', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newHandle = putUserProfileSethandleV1(newUser1.body.token, 'a');
    expect(newHandle.statusCode).toBe(ERROR);
  });

  test('/user/profile/sethandle/v1: length of handleStr is not between 3 and 20 characters inclusive, too long', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newHandle = putUserProfileSethandleV1(newUser1.body.token, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(newHandle.statusCode).toBe(ERROR);
  });

  test('/user/profile/sethandle/v1: Success: length of handleStr is exactly 3', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newHandle = putUserProfileSethandleV1(newUser1.body.token, 'aB1');
    expect(newHandle.body).toStrictEqual({});
    expect(newHandle.statusCode).toBe(OK);
  });

  test('/user/profile/sethandle/v1: Success: length of handleStr is exactly 20', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newHandle = putUserProfileSethandleV1(newUser1.body.token, 'a1b2c3d4e5f6g7h8i9j1');
    expect(newHandle.body).toStrictEqual({});
    expect(newHandle.statusCode).toBe(OK);
  });

  test('/user/profile/sethandle/v1: handleStr contains characters that are not alphanumeric', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newHandle = putUserProfileSethandleV1(newUser1.body.token, 'asduab??$$$$');
    expect(newHandle.statusCode).toBe(ERROR);
  });

  test('/user/profile/sethandle/v1: the handle is already used by another user', () => {
    postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello1@email.com', 'password123', 'bill', 'gates');
    // User2 attempts to change their handle to that of User1
    const newHandle = putUserProfileSethandleV1(newUser2.body.token, 'globalowner');
    expect(newHandle.statusCode).toBe(ERROR);
  });
});
