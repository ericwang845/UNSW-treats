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

function postChannelsCreate(token: string, name: string, isPublic: boolean) {
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

function postAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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

function postChannelJoin(token: string, channelId: number) {
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

describe('Testing /channel/join/v3:', () => {
  test('/channel/join/v2: channelId does not refer to a valid channel, 1 channel', () => {
    const newUser1 = postAuthRegister('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreate(newUser1.body.token, 'Main Channel', true);
    const channelJoin = postChannelJoin(newUser2.body.token, newChannel.body.channelId + 1);
    expect(channelJoin.statusCode).toBe(ERROR);
  });

  // Assumption: must input a valid token when joining a channel
  test('/channel/join/v3: invalid token', () => {
    const newUser1 = postAuthRegister('hello@email.com', 'password123', 'global', 'owner');
    const newChannel = postChannelsCreate(newUser1.body.token, 'Main Channel', true);
    const channelJoin = postChannelJoin(newChannel.body.token + 1, newChannel.body.channelId);
    expect(channelJoin.statusCode).toBe(AUTH_ERROR);
  });

  test('/channel/join/v3: authorised user is already a member of the channel', () => {
    const newUser1 = postAuthRegister('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreate(newUser1.body.token, 'Main Channel', true);
    const channelJoin = postChannelJoin(newUser2.body.token, newChannel.body.channelId);
    const channelJoinAgain = postChannelJoin(newUser2.body.token, newChannel.body.channelId);
    expect(channelJoin.body).toStrictEqual({});
    expect(channelJoin.statusCode).toBe(OK);
    expect(channelJoinAgain.statusCode).toBe(ERROR);
  });

  test('/channel/join/v3: channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner', () => {
    const newUser1 = postAuthRegister('hello@email.com', 'password123', 'global', 'owner');
    const notGlobalOwner = postAuthRegister('hello2@email.com', 'password123', 'Doja', 'Cat');
    const newChannel = postChannelsCreate(newUser1.body.token, 'Private Channel', false);
    const channelJoin = postChannelJoin(notGlobalOwner.body.token, newChannel.body.channelId);
    expect(channelJoin.statusCode).toBe(AUTH_ERROR);
  });

  test('/channel/join/v3: Success: channelId is a private channel, and the authorised user is not a channel member but is a global owner', () => {
    const newUser1 = postAuthRegister('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('hello2@email.com', 'password123', 'Doja', 'Cat');
    const newChannel = postChannelsCreate(newUser2.body.token, 'Private Channel', false);
    const channelJoin = postChannelJoin(newUser1.body.token, newChannel.body.channelId);
    expect(channelJoin.body).toStrictEqual({});
    expect(channelJoin.statusCode).toBe(OK);
  });

  test('/channel/join/v3: Success: authuser joins public channel', () => {
    const newUser1 = postAuthRegister('hello@email.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('hello2@email.com', 'password123', 'Jeff', 'Bezos');
    const newChannel = postChannelsCreate(newUser1.body.token, 'Main Channel', true);
    const channelJoin = postChannelJoin(newUser2.body.token, newChannel.body.channelId);
    expect(channelJoin.body).toStrictEqual({});
    expect(channelJoin.statusCode).toBe(OK);
  });
});
