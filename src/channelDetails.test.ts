import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let c: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
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

function channelInviteReq(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
        `${config.url}:${config.port}` + '/channel/invite/v3',
        {
          json: {
            channelId: channelId,
            uId: uId
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

function channelDetailsReq(token: string, channelId: number) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/channel/details/v3`,
      {
        qs: {
          channelId: channelId
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

describe('///// TESTING channelDetailsV1 /////', () => {
  test('Success -> Returns Details of 1 Channel', () => {
    const bodyObj = channelDetailsReq(a1.token, c);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual({
      name: 'Channel Name',
      isPublic: true,
      ownerMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });

  test('Success -> Returns Details of Multiple Channels to 1 AuthUser', () => {
    const c2 = channelsCreateReq(a1.token, 'Channel Name2', false).body.channelId;
    const c3 = channelsCreateReq(a1.token, 'Channel Name3', false).body.channelId;
    let bodyObj = channelDetailsReq(a1.token, c);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual({
      name: 'Channel Name',
      isPublic: true,
      ownerMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ]
    });
    bodyObj = channelDetailsReq(a1.token, c2);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual({
      name: 'Channel Name2',
      isPublic: false,
      ownerMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ]
    });
    bodyObj = channelDetailsReq(a1.token, c3);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual({
      name: 'Channel Name3',
      isPublic: false,
      ownerMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });

  test('Success -> Returns Details of 1 Channel with Multiple Users', () => {
    channelInviteReq(a1.token, c, a2.authUserId);
    channelInviteReq(a1.token, c, a3.authUserId);
    const bodyObj = channelDetailsReq(a1.token, c);
    expect(bodyObj.statusCode).toBe(OK);
    expect(bodyObj.body).toEqual({
      name: 'Channel Name',
      isPublic: true,
      ownerMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: expect.any(Number),
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'john.smith@gmail.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
        },
        {
          uId: expect.any(Number),
          nameFirst: 'Pasl',
          nameLast: 'Smith',
          email: 'pasl.smith@gmail.com',
          handleStr: 'paslsmith',
          profileImgUrl: expect.any(String),
        },
        {
          uId: expect.any(Number),
          nameFirst: 'Bris',
          nameLast: 'Smith',
          email: 'bris.smith@gmail.com',
          handleStr: 'brissmith',
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });

  test('Fail -> Invalid Token', () => {
    const bodyObj = channelDetailsReq('', c);
    expect(bodyObj.statusCode).toBe(403);
  });

  test('Fail -> Invalid ChannelId', () => {
    const bodyObj = channelDetailsReq(a1.token, 99);
    expect(bodyObj.statusCode).toBe(400);
  });

  test('Fail -> AuthUser not a member of Channel', () => {
    const bodyObj = channelDetailsReq(a2.token, c);
    expect(bodyObj.statusCode).toBe(403);
  });
});
