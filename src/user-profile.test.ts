import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const AUTH_ERROR = 403;
const port = config.port;
const url = config.url;

// Wrapper function to send register http request
function authRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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

// Wrapper function to send user profile request
function userProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}/user/profile/v3`,
    {
      qs: {
        uId: uId,
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

describe('Testing user/profile/v3', () => {
  test('user/profile/v3: invalid Id', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const response = userProfile(newUser.body.token, parseInt(newUser.body.authUserId) + 50);
    expect(response.statusCode).toBe(ERROR);
  });

  test('user/profile/v3: invalid token', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const response = userProfile(newUser.body.token + 'abc123', parseInt(newUser.body.authUserId));
    expect(response.statusCode).toBe(AUTH_ERROR);
  });

  test('user/profile/v3: succesful return type', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const userDetails = userProfile(newUser.body.token, newUser.body.authUserId);
    expect(userDetails.body).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: newUser.body.authUserId,
          email: 'billybob242@gmail.com',
          nameFirst: 'Billy',
          nameLast: 'Bob',
          handleStr: 'billybob',
          profileImgUrl: expect.any(String),
        }
      })
    );
    expect(userDetails.statusCode).toBe(OK);
  });

  test('user/profile/v3: valid user viewing another user profile', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const newViewer = authRegister('jane48@gmail.com', 'dogsncats34', 'Jane', 'Apple');
    const userDetails = userProfile(newViewer.body.token, newUser.body.authUserId);
    expect(userDetails.body).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: newUser.body.authUserId,
          email: 'billybob242@gmail.com',
          nameFirst: 'Billy',
          nameLast: 'Bob',
          handleStr: 'billybob',
          profileImgUrl: expect.any(String),
        }
      })
    );
    expect(userDetails.statusCode).toBe(OK);
  });
});
