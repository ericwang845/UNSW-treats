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

function postChannelsCreateV3(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
      `${url}:${port}` + '/channels/create/v3',
      {
        json: {
          name: name,
          isPublic: isPublic,
        },
        headers: {
          token: token,
        }
      }
  );
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

function postAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
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

function postChannelJoinV3(token: string, channelId: number) {
  const res = request(
    'POST',
      `${url}:${port}` + '/channel/join/v3',
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

function postChannelInvite(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
        `${url}:${port}` + '/channel/invite/v3',
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

function clear() {
  const res = request(
    'DELETE',
      `${url}:${port}` + '/clear/v1',
      {}
  );
  return JSON.parse(res.getBody() as string);
}

beforeEach(() => {
  clear();
});

afterEach(() => {
  clear();
});

describe('Testing /channel/invite/v3:', () => {
  test('/channel/invite/v3: channelId does not refer to a valid channel, 1 channel', () => {
    const newUser1 = postAuthRegisterV3('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV3('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreateV3(newUser1.body.token, 'Main Channel', true);
    const uId = newUser2.body.authUserId;
    const channelInvite = postChannelInvite(newUser1.body.token, newChannel.body.channelId + 1, uId);
    expect(channelInvite.statusCode).toBe(ERROR);
  });

  // Assumption: must input a valid token when joining a channel
  test('/channel/invite/v3: invalid token', () => {
    const newUser1 = postAuthRegisterV3('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV3('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreateV3(newUser1.body.token, 'Main Channel', true);
    const uId = newUser2.body.authUserId;
    const channelInvite = postChannelInvite(newUser1.body.token + 1, newChannel.body.channelId, uId);
    expect(channelInvite.statusCode).toBe(AUTH_ERROR);
  });

  test('/channel/invite/v3: invalid uId', () => {
    const newUser1 = postAuthRegisterV3('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV3('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreateV3(newUser1.body.token, 'Main Channel', true);
    const uId = newUser2.body.authUserId;
    const channelInvite = postChannelInvite(newUser1.body.token, newChannel.body.channelId, uId + 1);
    expect(channelInvite.statusCode).toBe(ERROR);
  });

  test('/channel/invite/v3: uId user is already a member of the channel they are invited to', () => {
    const newUser1 = postAuthRegisterV3('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV3('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreateV3(newUser1.body.token, 'Main Channel', true);
    postChannelJoinV3(newUser2.body.token, newChannel.body.channelId);
    const uId = newUser2.body.authUserId;
    const channelInvite = postChannelInvite(newUser1.body.token, newChannel.body.channelId, uId);
    expect(channelInvite.statusCode).toBe(ERROR);
  });

  test('/channel/invite/v3: channelId is valid and the authorised user is not a member of the channel', () => {
    const newUser1 = postAuthRegisterV3('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV3('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreateV3(newUser1.body.token, 'Main Channel', true);
    const uId = newUser2.body.authUserId;
    const channelInvite = postChannelInvite(newUser2.body.token, newChannel.body.channelId, uId);
    expect(channelInvite.statusCode).toBe(AUTH_ERROR);
  });

  test('/channel/invite/v3: Success: authuser invites to public channel', () => {
    const newUser1 = postAuthRegisterV3('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV3('hellooooo@email.com', 'password1234', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreateV3(newUser1.body.token, 'Main Channel', true);
    const uId = newUser2.body.authUserId;
    const channelInvite = postChannelInvite(newUser1.body.token, newChannel.body.channelId, uId);
    expect(channelInvite.body).toStrictEqual({});
    expect(channelInvite.statusCode).toBe(OK);
  });

  test('/channel/invite/v3: Success: authuser invites to private channel', () => {
    const newUser1 = postAuthRegisterV3('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegisterV3('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreateV3(newUser1.body.token, 'Main Channel', false);
    const uId = newUser2.body.authUserId;
    const channelInvite = postChannelInvite(newUser1.body.token, newChannel.body.channelId, uId);
    expect(channelInvite.body).toStrictEqual({});
    expect(channelInvite.statusCode).toBe(OK);
  });
});
