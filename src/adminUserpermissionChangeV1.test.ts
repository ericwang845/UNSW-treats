import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const AUTH_ERROR = 403;
const port = config.port;
const url = config.url;

// Wrapper function to send register http requests
function postAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
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

// Wrapper function to send setemail http request
function postAdminUserpermissionChangeV1(uId: number, permissionId: number, token: string) {
  const res = request(
    'POST',
    `${url}:${port}/admin/userpermission/change/v1`,
    {
      json: {
        uId: uId,
        permissionId: permissionId,
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

// Wrapper function to send clear http request
function clear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {}
  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

beforeEach(() => {
  clear();
});

afterEach(() => {
  clear();
});

describe('Testing admin/userpermission/change/v1', () => {
  test('admin/userpermission/change/v1: Failure -> invalid token', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const permissionChange = postAdminUserpermissionChangeV1(newUser.body.authUserId, 1, newUser.body.token + newUser2.body.token);
    expect(permissionChange.statusCode).toBe(AUTH_ERROR);
  });
  test('admin/userpermission/change/v1: Failure -> uId does not refer to a valid user', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const permissionChange = postAdminUserpermissionChangeV1(newUser.body.authUserId + newUser2.body.authUserId, 1, newUser.body.token);
    expect(permissionChange.statusCode).toBe(ERROR);
  });
  test('admin/userpermission/change/v1: Failure -> uId refers to a user who is the only global owner and they are being demoted to a user', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const permissionChange = postAdminUserpermissionChangeV1(newUser.body.authUserId, 2, newUser.body.token);
    expect(permissionChange.statusCode).toBe(ERROR);
  });
  test('admin/userpermission/change/v1: Failure -> permissionId is invalid', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const permissionChange = postAdminUserpermissionChangeV1(newUser2.body.authUserId, 3, newUser.body.token);
    expect(permissionChange.statusCode).toBe(ERROR);
  });
  test('admin/userpermission/change/v1: Failure -> the user already has the permissions level of permissionId', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const permissionChange = postAdminUserpermissionChangeV1(newUser2.body.authUserId, 2, newUser.body.token);
    expect(permissionChange.statusCode).toBe(ERROR);
  });
  test('admin/userpermission/change/v1: Failure -> the authUser is not a global owner', () => {
    postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newUser3 = postAuthRegister('joe@gmail.com', 'password123', 'joe', 'mama');
    const permissionChange = postAdminUserpermissionChangeV1(newUser3.body.authUserId, 1, newUser2.body.token);
    expect(permissionChange.statusCode).toBe(AUTH_ERROR);
  });
  test('admin/userpermission/change/v1: Success -> permission change', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const permissionChange = postAdminUserpermissionChangeV1(newUser2.body.authUserId, 1, newUser.body.token);
    expect(permissionChange.body).toMatchObject({});
    expect(permissionChange.statusCode).toBe(OK);
  });
  test('admin/userpermission/change/v1: Success -> permission change then change someone elses permissions with new permissions', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newUser3 = postAuthRegister('joe@gmail.com', 'password123', 'yo', 'yo');
    const permissionChange = postAdminUserpermissionChangeV1(newUser2.body.authUserId, 1, newUser.body.token);
    expect(permissionChange.body).toMatchObject({});
    expect(permissionChange.statusCode).toBe(OK);
    const permissionChange2 = postAdminUserpermissionChangeV1(newUser3.body.authUserId, 1, newUser2.body.token);
    expect(permissionChange2.body).toMatchObject({});
    expect(permissionChange2.statusCode).toBe(OK);
  });
});
