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

function usersStatsReq(token: string) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/users/stats/v1`,
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

describe('///// TESTING USERSSTATSV1 /////', () => {
  test('Success -> Return Stats of Workspace, 1 DM, 1 Channel, 1 Message', () => {
    const s = usersStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) }],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) }],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) }],
        utilizationRate: expect.any(Number)
      }
    });
  });
  test('Success -> Return Stats of Workspace, 1 Channel, Removed 1 DM, 1 Message', () => {
    DMRemoveReq(a1.token, d1);
    const s = usersStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) }],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
          { numDmsExist: 0, timeStamp: expect.any(Number) }],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) }],
        utilizationRate: expect.any(Number)
      }
    });
  });
  test('Success -> Return Stats of Workspace, 1 Channel, 1 DM, Removed 1 Message', () => {
    DMRemoveReq(a1.token, d1);
    messageRemoveReq(a1.token, m1);
    const s = usersStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) }],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
          { numDmsExist: 0, timeStamp: expect.any(Number) }],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) },
          { numMessagesExist: 0, timeStamp: expect.any(Number) }],
        utilizationRate: expect.any(Number)
      }
    });
  });
  test('Success -> Return Stats of Workspace, Create 3 Channels, Create 3 DMs, Send 3 Messages', () => {
    channelsCreateReq(a1.token, 'lol', true);
    channelsCreateReq(a1.token, 'lol', true);
    DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    messageSendReq(a1.token, c1, 'lol');
    messageSendReq(a1.token, c1, 'lol');
    const s = usersStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) },
          { numChannelsExist: 2, timeStamp: expect.any(Number) },
          { numChannelsExist: 3, timeStamp: expect.any(Number) }],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
          { numDmsExist: 2, timeStamp: expect.any(Number) },
          { numDmsExist: 3, timeStamp: expect.any(Number) }],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) },
          { numMessagesExist: 2, timeStamp: expect.any(Number) },
          { numMessagesExist: 3, timeStamp: expect.any(Number) }],
        utilizationRate: expect.any(Number)
      }
    });
  });
  test('Success -> Return Stats of Workspace, Create 3 Channels, Create 3 DMs then Remove 1, Send 3 Messages then Remove 1', () => {
    channelsCreateReq(a1.token, 'lol', true);
    channelsCreateReq(a1.token, 'lol', true);
    DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]);
    DMRemoveReq(a1.token, d1);
    messageSendReq(a1.token, c1, 'lol');
    messageSendReq(a1.token, c1, 'lol');
    messageRemoveReq(a1.token, m1);
    const s = usersStatsReq(a1.token);
    expect(s.statusCode).toBe(OK);
    expect(s.body).toEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) },
          { numChannelsExist: 2, timeStamp: expect.any(Number) },
          { numChannelsExist: 3, timeStamp: expect.any(Number) }],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
          { numDmsExist: 2, timeStamp: expect.any(Number) },
          { numDmsExist: 3, timeStamp: expect.any(Number) },
          { numDmsExist: 2, timeStamp: expect.any(Number) }],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) },
          { numMessagesExist: 2, timeStamp: expect.any(Number) },
          { numMessagesExist: 3, timeStamp: expect.any(Number) },
          { numMessagesExist: 2, timeStamp: expect.any(Number) }],
        utilizationRate: expect.any(Number)
      }
    });
  });
  test('Fail -> Invalid Token', () => {
    const s = usersStatsReq('');
    expect(s.statusCode).toBe(403);
  });
});
