import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let d: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
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

function DMDetailsReq(token: string, dmId: number) {
  try {
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
  } catch (err) {
    return { statusCode: err.statusCode };
  }
}

function DMRemoveReq(token: string, dmId: number) {
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

describe('///// TESTING DMDETAILS //////', () => {
  test('Success -> Return details of 1 DM', () => {
    const a = DMDetailsReq(a1.token, d);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      name: 'johnsmith, paslsmith',
      members: [
        {
          uId: expect.any(Number),
          email: 'pasl.smith@gmail.com',
          nameFirst: 'Pasl',
          nameLast: 'Smith',
          handleStr: 'paslsmith',
          profileImgUrl: expect.any(String),
        }, {
          uId: expect.any(Number),
          email: 'john.smith@gmail.com',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        },
      ]
    });
  });
  test('Success -> Return Details of DM after 1 user leaves', () => {
    DMLeaveReq(a2.token, d);
    const a = DMDetailsReq(a1.token, d);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      name: 'johnsmith, paslsmith',
      members: [
        {
          uId: expect.any(Number),
          email: 'john.smith@gmail.com',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        },
      ]
    });
  });
  test('Success -> Return Details of DM after Owner leaves', () => {
    DMLeaveReq(a1.token, d);
    const a = DMDetailsReq(a2.token, d);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      name: 'johnsmith, paslsmith',
      members: [
        {
          uId: expect.any(Number),
          email: 'pasl.smith@gmail.com',
          nameFirst: 'Pasl',
          nameLast: 'Smith',
          handleStr: 'paslsmith',
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
  test('Fail -> Return Details of DM after AuthUser leaves DM', () => {
    DMLeaveReq(a1.token, d);
    const a = DMDetailsReq(a1.token, d);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Return Details of Removed DM', () => {
    DMRemoveReq(a1.token, d);
    const a = DMDetailsReq(a1.token, d);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> Invalid Token', () => {
    const a = DMDetailsReq('', d);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Invalid DmId', () => {
    const a = DMDetailsReq(a1.token, -1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> Return Details of DM AuthUser is not a member of', () => {
    const a = DMDetailsReq(a3.token, d);
    expect(a.statusCode).toBe(403);
  });
});
