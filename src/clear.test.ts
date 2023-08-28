import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

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

describe('Testing clear/v1', () => {
  test('Test successful clear', () => {
    const clear = clearv1();
    expect(clear.statusCode).toBe(OK);
    expect(clear.body).toEqual({});
  });
  // Add more tests as other routes are implented
});
