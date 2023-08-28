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

function putUserProfileSetnameV1(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
        `${url}:${port}` + '/user/profile/setname/v2',
        {
          json: {
            nameFirst: nameFirst,
            nameLast: nameLast
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
  test('/user/profile/setname/v1: token is not valid', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token + 1, 'first', 'last');
    expect(newName.statusCode).toBe(AUTH_ERROR);
  });

  test('/user/profile/setname/v1: first name too short', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, '', 'last');
    expect(newName.statusCode).toBe(ERROR);
  });

  test('/user/profile/setname/v1: last name too short', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, 'first', '');
    expect(newName.statusCode).toBe(ERROR);
  });

  test('/user/profile/setname/v1: first name too long', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, 'inhilrhfmlsrfhjmlsrhfslslohslrshmlvhreluifemhrergeegri', 'last');
    expect(newName.statusCode).toBe(ERROR);
  });

  test('/user/profile/setname/v1: last name too long', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, 'last', 'inhilrhfmlsrfhjmlsrhfslslohslrshmlvhreluifemhrergeegri');
    expect(newName.statusCode).toBe(ERROR);
  });

  test('/user/profile/setname/v1: Success: first name exactly 1 character', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, 'a', 'last');
    expect(newName.body).toStrictEqual({});
    expect(newName.statusCode).toBe(OK);
  });

  test('/user/profile/setname/v1: Success: last name exactly 1 character', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, 'first', 'a');
    expect(newName.body).toStrictEqual({});
    expect(newName.statusCode).toBe(OK);
  });

  test('/user/profile/setname/v1: Success: first name exactly 50 charachters', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, 'inhilrhfmlsrfhjmlsrhfslslohslrshmlvhreluifemhrerge', 'last');
    expect(newName.body).toStrictEqual({});
    expect(newName.statusCode).toBe(OK);
  });

  test('/user/profile/setname/v1: Success: last name exactly 50 charachters', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, 'first', 'inhilrhfmlsrfhjmlsrhfslslohslrshmlvhreluifemhrerge');
    expect(newName.body).toStrictEqual({});
    expect(newName.statusCode).toBe(OK);
  });

  test('/user/profile/setname/v1: Success: names appropriate length', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newName = putUserProfileSetnameV1(newUser1.body.token, 'hellooo', 'yoooo');
    expect(newName.body).toStrictEqual({});
    expect(newName.statusCode).toBe(OK);
  });
});
