import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let d: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  d = DMCreateReq(a1.token, [a2.authUserId]).body.dmId;
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

function DMListReq(token: string) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/dm/list/v2`,
      {
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

function DMDetailsReq(token: string, dmId: number) {
  const res = request(
    'GET',
      `${config.url}:${config.port}/dm/details/v2`,
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
}

function DMLeaveReq(token: string, dmId: number) {
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
}

describe('///// TESTING DMLIST //////', () => {
  test('Success -> Return List of 1 DM', () => {
    DMDetailsReq(a1.token, d);
    const a = DMListReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      dms: [{
        dmId: expect.any(Number),
        name: 'johnsmith, paslsmith',
      }]
    });
  });
  test('Success -> Return List of 1 DM after AuthUser Joins', () => {
    const d1 = DMCreateReq(a2.token, [a1.authUserId]).body.dmId;
    DMLeaveReq(a1.token, d1);
    const a = DMListReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      dms: [{
        dmId: expect.any(Number),
        name: 'johnsmith, paslsmith',
      }]
    });
  });
  test('Success -> Return Empty List after AuthUser leaves 1 DM', () => {
    DMLeaveReq(a1.token, d);
    const a = DMListReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      dms: []
    });
  });
  test('Success -> Return Empty List after AuthUser leaves all DMs', () => {
    const d1 = DMCreateReq(a2.token, [a1.authUserId]).body.dmId;
    DMLeaveReq(a1.token, d1);
    DMLeaveReq(a1.token, d);
    const a = DMListReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      dms: []
    });
  });
  test('Fail -> Invalid Token', () => {
    const a = DMListReq('');
    expect(a.statusCode).toBe(403);
  });
});
