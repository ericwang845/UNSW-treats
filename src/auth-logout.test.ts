import request from 'sync-request';
import config from './config.json';

const OK = 200;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

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

describe('Testing auth/logout/v2', () => {
  test('auth/logout/v2: invalid token', () => {
    const newUser = authRegister('bobby289@gmail.com', 'password123', 'Bobby', 'Smith');
    const logout = authLogout(newUser.body.token + 'abc123');
    expect(logout.statusCode).toBe(FORBIDDEN);
  });

  test('auth/logout/v2: valid log out, then attempt to log out again', () => {
    authRegister('login455@gmail.com', 'loginPassword', 'Login', 'Test');
    const newUser = authLogin('login455@gmail.com', 'loginPassword');
    const response = authLogout(newUser.body.token);
    expect(response.body).toMatchObject({});
    expect(response.statusCode).toBe(OK);

    // User logged out, so token now invalid
    const response2 = authLogout(newUser.body.token);
    expect(response2.statusCode).toBe(FORBIDDEN);
  });

  test('auth/logout/v2: Same user logging in to multiple sessions, then logging out', () => {
    const newUser = authRegister('julia255@gmail.com', 'ILoveCats38', 'Julia', 'Sanders');
    const session = authLogin('julia255@gmail.com', 'ILoveCats38');
    const session2 = authLogin('julia255@gmail.com', 'ILoveCats38');
    // Three sessions created by same user, three different tokens
    expect(newUser.body.token).not.toEqual(session.body.token);
    expect(session.body.token).not.toEqual(session2.body.token);
    const response = authLogout(newUser.body.token);
    const response2 = authLogout(session.body.token);
    const response3 = authLogout(session2.body.token);

    expect(response.body).toMatchObject({});
    expect(response.statusCode).toBe(OK);
    expect(response2.body).toMatchObject({});
    expect(response2.statusCode).toBe(OK);
    expect(response3.body).toMatchObject({});
    expect(response3.statusCode).toBe(OK);
  });
});
