import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
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

describe('///// TESTING DMCREATE //////', () => {
  test('Success -> Create 1 DM', () => {
    const b = DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    expect(b.statusCode).toBe(OK);
    expect(b.body).toEqual({ dmId: expect.any(Number) });
  });
  test('Fail -> Invalid Token', () => {
    const b = DMCreateReq('', [a2.authUserId, a3.authUserId]);
    expect(b.statusCode).toBe(403);
  });
  test('Fail -> Invalid Userid in UIds', () => {
    const b = DMCreateReq(a1.token, [-1, a2.authUserId, a3.authUserId]);
    expect(b.statusCode).toBe(400);
  });
  test('Fail -> Duplicate Userid in UIds', () => {
    const b = DMCreateReq(a1.token, [a2.authUserId, a2.authUserId, a3.authUserId]);
    expect(b.statusCode).toBe(400);
  });
});
