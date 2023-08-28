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

// Wrapper function to send login http request
function authLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v3`,
    {
      json: {
        email: email,
        password: password,
      },
    }

  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

// Wrapper function to send setemail http request
function setEmail(token: string, email: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setemail/v2`,
    {
      json: {
        email: email,
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

describe('Testing user/profile/setemail/v2', () => {
  test('user/profile/setemail/v2: invalid token', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const response = setEmail(newUser.body.token + 'abc123', 'aNewEmail22@gmail.com');
    expect(response.statusCode).toBe(AUTH_ERROR);
  });

  test('user/profile/setemail/v2: invalid email', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const response = setEmail(newUser.body.token, 'AnInvalidEmail');
    expect(response.statusCode).toBe(ERROR);
  });

  test('user/profile/setemail/v2: email address already in use', () => {
    authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const secondUser = authRegister('glenn123@gmail.com', 'password123', 'Glen', 'Mate');
    const response = setEmail(secondUser.body.token, 'AnInvalidEmail');
    expect(response.statusCode).toBe(ERROR);
  });

  test('user/profile/setemail/v2: email address already in use', () => {
    authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const secondUser = authRegister('glenn123@gmail.com', 'password123', 'Glen', 'Mate');
    const response = setEmail(secondUser.body.token, 'glenn123@gmail.com');
    expect(response.statusCode).toBe(ERROR);
  });

  test('user/profile/setemail/v2: succesful change', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const response = setEmail(newUser.body.token, 'newEmail22@gmail.com');
    expect(response.body).toMatchObject({});
    expect(response.statusCode).toBe(OK);
  });

  test('user/profile/setemail/v2: succesful change, then login with new email', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const response = setEmail(newUser.body.token, 'newEmail22@gmail.com');
    expect(response.body).toMatchObject({});
    expect(response.statusCode).toBe(OK);

    const login = authLogin('newEmail22@gmail.com', 'password123');
    expect(login.body).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: newUser.body.authUserId,
      })
    );
    expect(login.statusCode).toBe(OK);
  });

  test('user/profile/setemail/v2: succesful change, then check profile for update', () => {
    const newUser = authRegister('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const response = setEmail(newUser.body.token, 'newEmail22@gmail.com');
    expect(response.body).toMatchObject({});
    expect(response.statusCode).toBe(OK);

    const userDetails = userProfile(newUser.body.token, newUser.body.authUserId);
    expect(userDetails.body).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: newUser.body.authUserId,
          email: 'newEmail22@gmail.com',
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
