import request from 'sync-request';
import config from './config.json';

const OK = 200;
// const ERROR = 400;
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

// Wrapper function to send logout http request
function authLogout(token: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/logout/v2`,
    {
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode !== OK) {
    return {
      statusCode: res.statusCode
    };
  } else {
    return {
      body: JSON.parse(res.getBody() as string),
      statusCode: res.statusCode,
    };
  }
}

// Wrapper function to send login request
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
  if (res.statusCode !== OK) {
    return {
      statusCode: res.statusCode
    };
  } else {
    return {
      body: JSON.parse(res.getBody() as string),
      statusCode: res.statusCode,
    };
  }
}

// Wrapper function to send passwordreset request http request
function requestReset(email: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/request/v1`,
    {
      json: {
        email: email
      }
    }
  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
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

describe('Testing auth/passwordreset/request/v1', () => {
  test('auth/passwordreset/request/v1: registered email', () => {
    authRegister('arayneon@gmail.com', 'password123', 'Billy', 'Bob');
    const response = requestReset('arayneon@gmail.com');
    expect(response.statusCode).toBe(OK);
    expect(response.body).toStrictEqual({});
  });
  test('auth/passwordreset/request/v1: email that is not registered', () => {
    const response = requestReset('billybob242@gmail.com');
    expect(response.statusCode).toBe(OK);
    expect(response.body).toStrictEqual({});
  });
  // Testing that all sessions for that user are logged out
  test('auth/passwordreset/request/v1: logging out of all the users sessions', () => {
    const session1 = authRegister('arayneon@gmail.com', 'password123', 'Billy', 'Bob');
    const session = authLogin('arayneon@gmail.com', 'password123');
    const response = requestReset('arayneon@gmail.com');
    // both sessions should now be logged out
    expect(response.statusCode).toBe(OK);
    expect(response.body).toStrictEqual({});
    const logout = authLogout(session.body.token);
    const logout1 = authLogout(session1.body.token);
    expect(logout.statusCode).toBe(AUTH_ERROR);
    expect(logout1.statusCode).toBe(AUTH_ERROR);
  });
});
