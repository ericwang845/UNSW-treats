import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let c1: number;
let d1: number;
let m1: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
  c1 = channelsCreateReq(a1.token, 'lol', true).body.channelId;
  d1 = DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]).body.dmId;
  m1 = messageSendReq(a1.token, c1, 'lol').body.messageId;
});

afterEach(() => {
  clearv1();
});

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

function DMCreateReq(token: string, uIds: Array<number>) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/dm/create/v2`,
      {
        json: {
          uIds: uIds
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

function channelsCreateReq(token: string, name: string, isPublic: boolean) {
  try {
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
  } catch (err) {
    return { statusCode: err.statusCode };
  }
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

function DMLeaveReq(token: string, dmId: number) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/dm/leave/v2`,
      {
        json: {
          dmId: dmId,
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

function messageRemoveReq(token: string, messageId: number) {
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
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
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
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

function DMRemoveReq(token: string, dmId: number) {
  try {
    const res = request(
      'DELETE',
      `${config.url}:${config.port}/dm/remove/v2`,
      {
        qs: {
          dmId: dmId,
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

function userStatsReq(token: string) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/user/stats/v1`,
      {
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

describe('///// TESTING USERSTATSV1 /////', () => {
  test('Success -> Return Stats of AuthUser, 1 DM, 1 Channel, 1 Message', () => {
    const s = userStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) }],
        involvementRate: 1,
      }
    });
  });
  test('Success -> Return Stats of AuthUser, Left 1 Channel, 1 DM, 1 Message', () => {
    channelLeaveReq(a1.token, c1);
    const s = userStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) }],
        involvementRate: 2 / 3,
      }
    });
  });
  test('Success -> Return Stats of AuthUser, 1 Channel, Left 1 DM, 1 Message', () => {
    DMLeaveReq(a1.token, d1);
    const s = userStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) }],
        involvementRate: 2 / 3
      }
    });
  });
  test('Success -> Return Stats of AuthUser, Left 1 Channel, Left 1 DM, 1 Message', () => {
    DMLeaveReq(a1.token, d1);
    channelLeaveReq(a1.token, d1);
    const s = userStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) }],
        involvementRate: 1 / 3
      }
    });
  });
  test('Success -> Return Stats of AuthUser, 1 Channel, 1 DM, Removed 1 Message', () => {
    messageRemoveReq(a1.token, m1);
    const s = userStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) }],
        involvementRate: 1
      }
    });
  });
  test('Success -> Return Stats of AuthUser, Create 3 Channels, Create 3 DMs, Send 3 Messages', () => {
    channelsCreateReq(a1.token, 'lol', true);
    channelsCreateReq(a1.token, 'lol', true);
    DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    messageSendReq(a1.token, c1, 'lol');
    messageSendReq(a1.token, c1, 'lol');
    const s = userStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 2, timeStamp: expect.any(Number) },
          { numChannelsJoined: 3, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 2, timeStamp: expect.any(Number) },
          { numDmsJoined: 3, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
          { numMessagesSent: 2, timeStamp: expect.any(Number) },
          { numMessagesSent: 3, timeStamp: expect.any(Number) }],
        involvementRate: 9 / 9
      }
    });
  });
  test('Success -> Return Stats of AuthUser, Create 3 Channels then Leave 1, Create 3 DMs then Leave 1, Send 3 Messages then Remove 1', () => {
    const c2 = channelsCreateReq(a1.token, 'lol', true).body.channelId;
    channelsCreateReq(a1.token, 'lol', true);
    channelLeaveReq(a1.token, c2);
    DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    DMLeaveReq(a1.token, d1);
    messageSendReq(a1.token, c1, 'lol');
    messageSendReq(a1.token, c1, 'lol');
    messageRemoveReq(a1.token, m1);
    const s = userStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 2, timeStamp: expect.any(Number) },
          { numChannelsJoined: 3, timeStamp: expect.any(Number) },
          { numChannelsJoined: 2, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 2, timeStamp: expect.any(Number) },
          { numDmsJoined: 3, timeStamp: expect.any(Number) },
          { numDmsJoined: 2, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
          { numMessagesSent: 2, timeStamp: expect.any(Number) },
          { numMessagesSent: 3, timeStamp: expect.any(Number) }],
        involvementRate: 7 / 8
      }
    });
  });
  test('Success -> Return Stats of AuthUser, Join 1 Channel', () => {
    postChannelJoin(a2.token, c1);
    const s = userStatsReq(a2.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) }],
        involvementRate: 2 / 3
      }
    });
  });
  test('Success -> Return Stats of AuthUser, Invited to 1 Channel', () => {
    channelInviteReq(a1.token, c1, a2.authUserId);
    const s = userStatsReq(a2.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) }],
        involvementRate: 2 / 3
      }
    });
  });
  test('Success -> Return Stats of AuthUser, Remove DM', () => {
    DMRemoveReq(a1.token, d1);
    const s = userStatsReq(a2.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) }],
        involvementRate: 0
      }
    });
  });
  test('Success -> Return Stats of AuthUser, No Channels, DMs, and Messages ', () => {
    clearv1();
    a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
    a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
    const s = userStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) }],
        involvementRate: 0
      }
    });
  });
  test('Fail -> Invalid Token', () => {
    const s = userStatsReq('');
    expect(s.statusCode).toBe(403);
  });
});
