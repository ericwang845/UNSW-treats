import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const port = config.port;
const url = config.url;

// Wrapper function to send passwordreset http request
function passwordReset(resetCode: string, newPassword: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/reset/v1`,
    {
      json: {
        resetCode: resetCode,
        newPassword: newPassword,
      }
    }
  );
  if (res.statusCode !== OK) {
    return {
      statusCode: res.statusCode
    };
  }
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

describe('Testing auth/passwordreset/reset/v1', () => {
  test('auth/passwordreset/reset/v1: invalid resetCode', () => {
    const response = passwordReset('invalid reset code', 'password123');
    expect(response.statusCode).toBe(ERROR);
  });
  test('auth/passwordreset/reset/v1: password less than 6 characters', () => {
    const response = passwordReset('B5CWP', 'pass');
    expect(response.statusCode).toBe(ERROR);
  });
});

// No jest tests for success
