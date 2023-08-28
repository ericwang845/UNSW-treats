import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const AUTH_ERROR = 403;
const port = config.port;
const url = config.url;

/*
Iteration 2
*/

function postMessageSendDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
      `${url}:${port}` + '/message/senddm/v2',
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

function postAuthRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
      `${url}:${port}` + '/auth/register/v3',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
  );
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

function postDmCreateV1(token: string, uIds: number[]) {
  const res = request(
    'POST',
      `${url}:${port}` + '/dm/create/v2',
      {
        json: {
          uIds: uIds
        },
        headers: {
          token: token,
        }
      }
  );
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

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

describe('Testing /message/senddm/v2:', () => {
  test('/message/senddm/v1: dmId does not refer to a valid DM', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser1.body.token, newDm.body.dmId + 1, 'get out outta me swamp');
    expect(newDmSent.statusCode).toBe(ERROR);
  });

  // Assumption: must input a valid token when joining a channel
  test('/message/senddm/v2: invalid token', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser1.body.token + newUser2.body.token, newDm.body.dmId, 'get out outta me swamp');
    expect(newDmSent.statusCode).toBe(AUTH_ERROR);
  });

  test('/message/senddm/v2: length of message is less than 1 character', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser1.body.token, newDm.body.dmId, '');
    expect(newDmSent.statusCode).toBe(ERROR);
  });

  test('/message/senddm/v2: length of message is greater than 1000 characters', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser1.body.token, newDm.body.dmId, '1234567890'.repeat(101));
    expect(newDmSent.statusCode).toBe(ERROR);
  });

  test('/message/senddm/v2: dmId is valid and the authorised user is not a member of the DM', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newUser3 = postAuthRegisterV2('hello3@email.com', 'password123', 'paul', 'mccartney');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser3.body.token, newDm.body.dmId, 'do you smell updog?');
    expect(newDmSent.statusCode).toBe(AUTH_ERROR);
  });

  test('/message/senddm/v2: Success: length of message is exactly 1 character', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser1.body.token, newDm.body.dmId, 'a');
    expect(newDmSent.body).toStrictEqual({
      messageId: newDmSent.body.messageId
    });
    expect(newDmSent.statusCode).toBe(OK);
  });

  test('/message/senddm/v2: Success: length of message is exactly 1000 characters', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser1.body.token, newDm.body.dmId, '1234567890'.repeat(100));
    expect(newDmSent.body).toStrictEqual({
      messageId: newDmSent.body.messageId
    });
    expect(newDmSent.statusCode).toBe(OK);
  });

  test('/message/senddm/v2: Success: 2 users', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser1.body.token, newDm.body.dmId, 'whats poppin');
    expect(newDmSent.body).toStrictEqual({
      messageId: newDmSent.body.messageId
    });
    expect(newDmSent.statusCode).toBe(OK);
  });

  test('/message/senddm/v2: Success: 4 users', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newUser3 = postAuthRegisterV2('hello3@email.com', 'password123', 'ferris', 'bueller');
    const newUser4 = postAuthRegisterV2('hello4@email.com', 'password123', 'nicki', 'minaj');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId, newUser3.body.authUserId, newUser4.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser1.body.token, newDm.body.dmId, 'trimesters are soooo great');
    expect(newDmSent.body).toStrictEqual({
      messageId: newDmSent.body.messageId
    });
    expect(newDmSent.statusCode).toBe(OK);
  });

  test('/message/senddm/v2: Success: 4 users, not sent from global owner', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newUser3 = postAuthRegisterV2('hello3@email.com', 'password123', 'ferris', 'bueller');
    const newUser4 = postAuthRegisterV2('hello4@email.com', 'password123', 'nicki', 'minaj');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId, newUser3.body.authUserId, newUser4.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser2.body.token, newDm.body.dmId, 'trimesters are soooo great');
    expect(newDmSent.body).toStrictEqual({
      messageId: newDmSent.body.messageId
    });
    expect(newDmSent.statusCode).toBe(OK);
  });

  test('/message/senddm/v2: Success: 4 users, not created by global owner', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newUser3 = postAuthRegisterV2('hello3@email.com', 'password123', 'ferris', 'bueller');
    const newUser4 = postAuthRegisterV2('hello4@email.com', 'password123', 'nicki', 'minaj');
    const newDm = postDmCreateV1(newUser2.body.token, [newUser1.body.authUserId, newUser3.body.authUserId, newUser4.body.authUserId]);
    const newDmSent = postMessageSendDm(newUser2.body.token, newDm.body.dmId, 'trimesters are soooo great');
    expect(newDmSent.body).toStrictEqual({
      messageId: newDmSent.body.messageId
    });
    expect(newDmSent.statusCode).toBe(OK);
  });

  test('/message/senddm/v2: Success: 4 users, sending multiple messages', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newUser3 = postAuthRegisterV2('hello3@email.com', 'password123', 'ferris', 'bueller');
    const newUser4 = postAuthRegisterV2('hello4@email.com', 'password123', 'nicki', 'minaj');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId, newUser3.body.authUserId, newUser4.body.authUserId]);
    const newDmSent1 = postMessageSendDm(newUser1.body.token, newDm.body.dmId, 'trimesters are soooo great');
    const newDmSent2 = postMessageSendDm(newUser3.body.token, newDm.body.dmId, 'yes i love watching people travel around italy while i study');
    expect(newDmSent1.body).toStrictEqual({
      messageId: newDmSent1.body.messageId
    });
    expect(newDmSent1.statusCode).toBe(OK);
    expect(newDmSent2.body).toStrictEqual({
      messageId: newDmSent2.body.messageId
    });
    expect(newDmSent2.statusCode).toBe(OK);
  });

  test('/message/senddm/v2: Success: 4 users, sending multiple messages, testing messageId', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newUser3 = postAuthRegisterV2('hello3@email.com', 'password123', 'ferris', 'bueller');
    const newUser4 = postAuthRegisterV2('hello4@email.com', 'password123', 'nicki', 'minaj');
    const newDm = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId, newUser3.body.authUserId, newUser4.body.authUserId]);
    const newDmSent1 = postMessageSendDm(newUser1.body.token, newDm.body.dmId, 'trimesters are soooo great');
    const newDmSent2 = postMessageSendDm(newUser3.body.token, newDm.body.dmId, 'yes i love watching people travel around italy while i study');
    expect(newDmSent1.body).toStrictEqual({
      messageId: expect.any(Number)
    });
    expect(newDmSent1.statusCode).toBe(OK);
    expect(newDmSent2.body).toStrictEqual({
      messageId: expect.any(Number)
    });
    expect(newDmSent2.statusCode).toBe(OK);
  });

  test('/message/senddm/v2: Success: 4 users, using multiple DMS', () => {
    const newUser1 = postAuthRegisterV2('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV2('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newUser3 = postAuthRegisterV2('hello3@email.com', 'password123', 'ferris', 'bueller');
    const newUser4 = postAuthRegisterV2('hello4@email.com', 'password123', 'nicki', 'minaj');
    const newDm1 = postDmCreateV1(newUser1.body.token, [newUser2.body.authUserId, newUser3.body.authUserId, newUser4.body.authUserId]);
    const newDmSent1 = postMessageSendDm(newUser1.body.token, newDm1.body.dmId, 'trimesters are soooo great');
    const newDmSent2 = postMessageSendDm(newUser3.body.token, newDm1.body.dmId, 'yes i love watching people travel around italy while i study');
    expect(newDmSent1.body).toStrictEqual({
      messageId: newDmSent1.body.messageId
    });
    expect(newDmSent1.statusCode).toBe(OK);
    expect(newDmSent2.body).toStrictEqual({
      messageId: newDmSent2.body.messageId
    });
    expect(newDmSent2.statusCode).toBe(OK);
    const newDm2 = postDmCreateV1(newUser3.body.token, [newUser2.body.authUserId, newUser4.body.authUserId]);
    const newDmSent3 = postMessageSendDm(newUser2.body.token, newDm2.body.dmId, 'wowawewa');
    const newDmSent4 = postMessageSendDm(newUser3.body.token, newDm2.body.dmId, 'i have chair');
    expect(newDmSent3.body).toStrictEqual({
      messageId: newDmSent3.body.messageId
    });
    expect(newDmSent3.statusCode).toBe(OK);
    expect(newDmSent4.body).toStrictEqual({
      messageId: newDmSent4.body.messageId
    });
  });
});
