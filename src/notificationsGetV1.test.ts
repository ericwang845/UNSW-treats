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

function postMessageSendDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
      `${config.url}:${config.port}` + '/message/senddm/v2',
      {
        json: {
          dmId: dmId,
          message: message,
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

function messageEditReq(token: string, messageId: number, message: string) {
  try {
    const res = request(
      'PUT',
    `${config.url}:${config.port}/message/edit/v2`,
    {
      json: {
        messageId: messageId,
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
  } catch (err) {
    return { statusCode: err.statusCode };
  }
}

function messageShareReq(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/message/share/v1`,
      {
        json: {
          ogMessageId: ogMessageId,
          message: message,
          channelId: channelId,
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

function notificationsGetReq(token: string) {
  try {
    const res = request(
      'GET',
      `${config.url}:${config.port}/notifications/get/v1`,
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

describe('///// TESTING NOTIFICATIONSGET /////', () => {
  test('Success -> Returns AuthUsers 0 Notifications', () => {
    const a4 = authRegister('ayy.lmao@gmail.com', 'hunter2', 'lol', 'lmao').body;
    const a = notificationsGetReq(a4.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({ notifications: [] });
  });
  test('Success -> Returns AuthUsers 1 Channel Message Tag Notification', () => {
    messageSendReq(a1.token, c1, 'lol @johnsmith');
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: expect.any(Number),
          dmId: -1,
          notificationMessage: 'johnsmith tagged you in lol: lol @johnsmith'
        }]
    });
  });
  test('Success -> Returns AuthUser 0 notifications, User is not a member of Channel', () => {
    messageSendReq(a1.token, c1, 'lol @paslsmith');
    const a = notificationsGetReq(a2.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [{
        channelId: -1,
        dmId: 1,
        notificationMessage: 'johnsmith added you to brissmith, johnsmith, paslsmith',
      }]
    });
  });
  test('Success -> Returns AuthUser 0 notifications, User is not a member of DM', () => {
    const d2 = DMCreateReq(a1.token, []).body.dmId;
    postMessageSendDm(a1.token, d2, 'lol @paslsmith');
    const a = notificationsGetReq(a2.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [{
        channelId: -1,
        dmId: 1,
        notificationMessage: 'johnsmith added you to brissmith, johnsmith, paslsmith',
      }]
    });
  });
  test('Success -> Returns AuthUsers 1 DM Message Tag Notification', () => {
    postMessageSendDm(a1.token, d1, 'lol @johnsmith');
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: -1,
          dmId: d1,
          notificationMessage: 'johnsmith tagged you in brissmith, johnsmith, paslsmith: lol @johnsmith'
        }]
    });
  });
  test('Success -> Returns AuthUsers 1 Channel Message Tag Notification after Message Edit', () => {
    messageEditReq(a1.token, m1, 'lol @johnsmith');
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: c1,
          dmId: -1,
          notificationMessage: 'johnsmith tagged you in lol: lol @johnsmith'
        }]
    });
  });
  test('Success -> Returns AuthUsers 1 DM Message Tag Notification after Message Edit', () => {
    const dm1 = postMessageSendDm(a1.token, d1, 'lol @johnsmith').body.dmId;
    messageEditReq(a1.token, dm1, 'lol @johnsmith');
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: -1,
          dmId: d1,
          notificationMessage: 'johnsmith tagged you in brissmith, johnsmith, paslsmith: lol @johnsmith'
        }]
    });
  });
  test('Success -> Returns AuthUsers 1 Channel Message Tag Notification, Message cut off at 20 Char', () => {
    messageEditReq(a1.token, m1, '@johnsmith If 700,000 people die in hospitals every year. Why dont we close down these hospitals and prevent those deaths?');
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: c1,
          dmId: -1,
          notificationMessage: 'johnsmith tagged you in lol: @johnsmith If 700,00'
        }]
    });
  });
  test('Success -> Returns AuthUsers 1 Channel Message Tag Notification from Message Share', () => {
    messageShareReq(a1.token, m1, '@johnsmith lmao', c1, -1);
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: c1,
          dmId: -1,
          notificationMessage: 'johnsmith tagged you in lol: lol@johnsmith lmao'
        }]
    });
  });
  test('Success -> Returns AuthUsers 1 DM Message Tag Notification from Message Share', () => {
    messageShareReq(a1.token, m1, '@johnsmith lmao', -1, d1);
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: -1,
          dmId: d1,
          notificationMessage: 'johnsmith tagged you in brissmith, johnsmith, paslsmith: lol@johnsmith lmao'
        }]
    });
  });
  test('Success -> Returns AuthUsers 1 Added to Channel Notification', () => {
    channelInviteReq(a1.token, c1, a2.authUserId);
    const a = notificationsGetReq(a2.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: expect.any(Number),
          dmId: -1,
          notificationMessage: 'johnsmith added you to lol'
        },
        {
          channelId: -1,
          dmId: expect.any(Number),
          notificationMessage: 'johnsmith added you to brissmith, johnsmith, paslsmith'
        }]
    });
  });
  test('Success -> Returns AuthUsers 1 Added to DM Notification', () => {
    const a = notificationsGetReq(a2.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: -1,
          dmId: d1,
          notificationMessage: 'johnsmith added you to brissmith, johnsmith, paslsmith'
        }]
    });
  });
  test('Success -> Returns AuthUsers 20 Tagged Notifications', () => {
    for (let i = 0; i < 20; i++) {
      messageSendReq(a1.token, c1, 'lol @johnsmith');
    }
    const compare = [];
    for (let i = 0; i < 20; i++) {
      compare.push({
        channelId: c1,
        dmId: -1,
        notificationMessage: 'johnsmith tagged you in lol: lol @johnsmith'
      });
    }
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({ notifications: compare });
  });
  test('Success -> Returns AuthUsers 20 Tagged Notifications from 21 Notifications', () => {
    for (let i = 0; i < 20; i++) {
      messageSendReq(a1.token, c1, 'lol @johnsmith');
    }
    messageSendReq(a1.token, c1, 'lmao @johnsmith');
    const compare = [];
    compare.push({
      channelId: c1,
      dmId: -1,
      notificationMessage: 'johnsmith tagged you in lol: lmao @johnsmith'
    });
    for (let i = 0; i < 19; i++) {
      compare.push({
        channelId: c1,
        dmId: -1,
        notificationMessage: 'johnsmith tagged you in lol: lol @johnsmith'
      });
    }
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({ notifications: compare });
  });
  test('Success -> User is not tagged Multiple times in a Single Message', () => {
    messageSendReq(a1.token, c1, 'lmao @johnsmith @johnsmith');
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: c1,
          dmId: -1,
          notificationMessage: 'johnsmith tagged you in lol: lmao @johnsmith @joh'
        }
      ]
    });
  });
  test('Success -> User is not tagged Multiple times in a Single Message', () => {
    postMessageSendDm(a1.token, c1, 'lmao @johnsmith @johnsmith');
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: [
        {
          channelId: -1,
          dmId: d1,
          notificationMessage: 'johnsmith tagged you in brissmith, johnsmith, paslsmith: lmao @johnsmith @joh'
        }
      ]
    });
  });
  test('Success -> Returns Empty notifications, Invalid userHandle, no User is tagged', () => {
    postMessageSendDm(a1.token, c1, 'lmao @john @john');
    const a = notificationsGetReq(a1.token);
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({
      notifications: []
    });
  });
  test('Fail -> Invalid Token', () => {
    const a = notificationsGetReq('');
    expect(a.statusCode).toBe(403);
  });
});
