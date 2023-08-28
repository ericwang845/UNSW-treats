import request from 'sync-request';
import config from './config.json';

const OK = 200;
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

function usersAllV1(token: string) {
  const res = request(
    'GET',
      `${url}:${port}` + '/users/all/v2',
      {
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

describe('Testing /users/all/v1:', () => {
  test('/users/all/v1: token is not valid', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const usersAll = usersAllV1(newUser1.body.token + 1);
    expect(usersAll.statusCode).toBe(AUTH_ERROR);
  });

  test('/users/all/v1: Success: token is valid, 1 user', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const usersAll = usersAllV1(newUser1.body.token);
    expect(usersAll.body).toStrictEqual({
      users: [
        {
          uId: newUser1.body.authUserId,
          email: 'hello@email.com',
          nameFirst: 'global',
          nameLast: 'owner',
          handleStr: 'globalowner',
          profileImgUrl: expect.any(String),
        }
      ]
    });
    expect(usersAll.statusCode).toBe(OK);
  });

  test('/users/all/v1: Success: token is valid, 3 users', () => {
    const newUser1 = postAuthRegisterV2('hello1@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'joe', 'mama');
    const newUser3 = postAuthRegisterV2('hello3@email.com', 'password123', 'matt', 'damon');
    const usersAll = usersAllV1(newUser3.body.token);
    expect(usersAll.body).toStrictEqual({
      users: [
        {
          uId: newUser1.body.authUserId,
          email: 'hello1@email.com',
          nameFirst: 'global',
          nameLast: 'owner',
          handleStr: 'globalowner',
          profileImgUrl: expect.any(String),
        },
        {
          uId: newUser2.body.authUserId,
          email: 'hello2@email.com',
          nameFirst: 'joe',
          nameLast: 'mama',
          handleStr: 'joemama',
          profileImgUrl: expect.any(String),
        },
        {
          uId: newUser3.body.authUserId,
          email: 'hello3@email.com',
          nameFirst: 'matt',
          nameLast: 'damon',
          handleStr: 'mattdamon',
          profileImgUrl: expect.any(String),
        }
      ]
    });

    expect(usersAll.statusCode).toBe(OK);
  });
});
