import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let c: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  c = channelsCreateReq(a1.token, 'Channel Name', true).body.channelId;
});

afterEach(() => {
  clearv1();
});

// Wrapper function to send register http request
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

// Wrapper function to send clear http request
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

function channelsCreateReq(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
        `${config.url}:${config.port}/channels/create/v3`,
        {
          json: {
            name: name,
            isPublic: isPublic
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

function postChannelJoin(token: string, channelId: number) {
  const res = request(
    'POST',
      `${config.url}:${config.port}` + '/channel/join/v3',
      {
        json: {
          channelId: channelId,
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

function standUpStartReq(token: string, channelId: number, length: number) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/standup/start/v1`,
      {
        json: {
          channelId: channelId,
          length: length
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

function channelLeaveReq(token:string, channelId: number) {
  try {
    const res = request(
      'POST',
        `${config.url}:${config.port}/channel/leave/v2`,
        {
          json: {
            channelId: channelId,
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

describe('///// TESTING CHANNELLEAVEV1 /////', () => {
  test('Success -> Owner leaves 1 Channel', () => {
    const bodyObj = channelLeaveReq(a1.token, c);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual({});
  });
  test('Success -> Channel Member leaves 1 Channel', () => {
    postChannelJoin(a2.token, c);
    const bodyObj = channelLeaveReq(a2.token, c);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual({});
  });
  test('Fail -> Invalid Token', () => {
    const bodyObj = channelLeaveReq('', c);
    expect(bodyObj.statusCode).toBe(403);
  });
  test('Fail -> Invalid ChannelId', () => {
    const bodyObj = channelLeaveReq(a1.token, -1);
    expect(bodyObj.statusCode).toBe(400);
  });
  test('Fail -> AuthUser not a member of Channel', () => {
    const bodyObj = channelLeaveReq(a2.token, c);
    expect(bodyObj.statusCode).toBe(403);
  });
  test('Fail -> AuthUser leading a Standup', async () => {
    standUpStartReq(a1.token, c, 1);
    const bodyObj = channelLeaveReq(a1.token, c);
    await new Promise((r) => setTimeout(r, 4000));
    expect(bodyObj.statusCode).toBe(400);
  });
});
