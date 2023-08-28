import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let c: number;
let m: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
  c = channelsCreateReq(a1.token, 'Channel Name', true).body.channelId;
  m = messageSendReq(a1.token, c, 'ah yeh').body.messageId;
});

function postChannelInviteV2(token: string, channelId: number, uId: number) {
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
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

function messageSendReq(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${config.url}:${config.port}/message/send/v2`,
    {
      json: {
        channelId: channelId,
        message: message,
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

function addOwnerReq(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${config.url}:${config.port}/channel/addowner/v2`,
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

function channelLeaveReq(token:string, channelId: number) {
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
}

function messageRemoveReq(token: string, messageId: number) {
  try {
    const res = request(
      'DELETE',
      `${config.url}:${config.port}/message/remove/v2`,
      {
        qs: {
          messageId: messageId,
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

describe('///// TESTING MESSAGE REMOVE /////', () => {
  test('Success -> Message is removed', () => {
    const a = messageRemoveReq(a1.token, m);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({});
  });
  test('Fail -> Invalid Token', () => {
    const a = messageRemoveReq('', m);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Invalid MessageId', () => {
    const a = messageRemoveReq(a1.token, -1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser is not the Original Author of Message, and is not a Member of the Channel', () => {
    const c1 = channelsCreateReq(a2.token, 'Channel Name2', true).body.channelId;
    const m1 = messageSendReq(a2.token, c1, 'ah yeh').body.messageId;
    const a = messageRemoveReq(a1.token, m1);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser leaves Channel before removing the Message', () => {
    postChannelInviteV2(a1.token, c, a2.authUserId);
    addOwnerReq(a1.token, c, a2.authUserId);
    channelLeaveReq(a1.token, c);
    const a = messageRemoveReq(a1.token, m);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser is not a member of the Channel where the Message exists', () => {
    const a = messageRemoveReq(a3.token, m);
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser is not the original Author of the Message', () => {
    postChannelInviteV2(a1.token, c, a2.authUserId);
    const a = messageRemoveReq(a2.token, m);
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> AuthUser does not have Owner Permissions in the Channel', () => {
    postChannelInviteV2(a1.token, c, a2.authUserId);
    const a = messageRemoveReq(a2.token, m);
    expect(a.statusCode).toBe(403);
  });
});
