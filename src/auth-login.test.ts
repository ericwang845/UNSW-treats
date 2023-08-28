import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const port = config.port;
const url = config.url;

// Wrapper function to send login http request
export function authLogin(email: string, password: string) {
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
export function authRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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

describe('Testing auth/login/v3', () => {
  test('auth/login/v3: Email not belong to a registered user', () => {
    const res = authLogin('example@email.com', 'password123');
    expect(res.statusCode).toBe(ERROR);
  });

  test('auth/login/v3: Incorrect password', () => {
    authRegister('login455@gmail.com', 'loginPassword', 'Login', 'Test');
    const res = authLogin('login455@gmail.com', 'incorrectPassword');
    expect(res.statusCode).toBe(ERROR);
  });

  test('auth/login/v3: Correct Return Type (successful login)', () => {
    authRegister('julia255@gmail.com', 'ILoveCats38', 'Julia', 'Sanders');
    const response = authLogin('julia255@gmail.com', 'ILoveCats38');
    expect(response.body).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number),
      })
    );
    expect(response.statusCode).toBe(OK);
  });
});
