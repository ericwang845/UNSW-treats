import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
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
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

// Wrapper function to send clear http request
function clearv1() {
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
  clearv1();
});

afterEach(() => {
  clearv1();
});

describe('Testing auth/register/v3', () => {
  test('auth/register/v3 : invalid email', () => {
    const response = authRegister('invalidEmail', 'password123', 'firstName', 'lastName');
    expect(response.statusCode).toBe(ERROR);
  });

  test('auth/register/v3 : email already in use', () => {
    authRegister('example@email.com', 'password123', 'firstName', 'firstName');
    const response = authRegister('example@email.com', 'password123', 'firstName', 'lastName');
    expect(response.statusCode).toBe(ERROR);
  });

  test('auth/register/v3: Invalid password (less than 6 characters)', () => {
    const response = authRegister('example@email.com', 'abc', 'firstName', 'lastName');
    expect(response.statusCode).toBe(ERROR);
  });

  test('auth/register/v3: Invalid firstName (empty string)', () => {
    const response = authRegister('example@email.com', 'password123', '', 'lastName');
    expect(response.statusCode).toBe(ERROR);
  });

  test('auth/register/v3: Invalid firstName (greater than 50 characters)', () => {
    const response = authRegister('example@email.com', 'password123', 'aReallyReallyReallyReallyReallyReallyReallyLongFirstName', 'lastName');
    expect(response.statusCode).toBe(ERROR);
  });

  test('auth/register/v3: Invalid lastName (empty string)', () => {
    const response = authRegister('example@email.com', 'password123', 'firstName', '');
    expect(response.statusCode).toBe(ERROR);
  });

  test('auth/register/v3: Invalid lastName (greater than 50 characters)', () => {
    const response = authRegister('example@email.com', 'password123', 'firstName', 'aReallyReallyReallyReallyReallyReallyReallyLongLastName');
    expect(response.statusCode).toBe(ERROR);
  });

  test('auth/register/v3: Correct return type on success', () => {
    authRegister('example2@email.com', 'password124', 'firstName', 'lastNameeeee');
    const newUser = authRegister('example@email.com', 'password123', 'firstName', 'lastNameeeee');
    expect(newUser.body).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number),
      })
    );
    expect(newUser.statusCode).toBe(OK);
  });

  test('auth/register/v3: Successful register, then login', () => {
    const newUser = authRegister('example@email.com', 'password123', 'firstName', 'lastName');
    expect(newUser.body).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number),
      })
    );
    expect(newUser.statusCode).toBe(OK);
    const login = authLogin('example@email.com', 'password123');
    expect(login.body).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number),
      })
    );
    expect(login.statusCode).toBe(OK);
  });
});
