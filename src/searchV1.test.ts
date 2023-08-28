import request from 'sync-request';
import config from './config.json';

const OK = 200;
const ERROR = 400;
const AUTH_ERROR = 403;
const port = config.port;
const url = config.url;

// Wrapper function to send register http requests
function postAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
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

// Wrapper function to create a DM
function postDmCreateV2(token: string, uIds: number[]) {
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

// Wrapper function to send messages to a DM
function postMessageSendDmV2(token: string, dmId: number, message: string) {
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
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
}

// Wrapper function for create channels requests
function postChannelsCreateV3(token: string, name: string, isPublic: boolean) {
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

// Wrapper function to send messages to a channel
function postMessageSendV1(token: string, channelId: number, message: string) {
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

// Wrapper function to send setemail http request
function getSearchV1(queryStr: string, token: string) {
  const res = request(
    'GET',
    `${url}:${port}/search/v1`,
    {
      qs: {
        queryStr: queryStr,
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

// Wrapper function to send clear http request
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

describe('Testing search/v1', () => {
  test('search/v1: Failure -> Invalid token', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const search = getSearchV1('hellooooo is it me youre looking forrrr', newUser.body.token + 'YOYOYO');
    expect(search.statusCode).toBe(AUTH_ERROR);
  });
  test('search/v1: Failure -> Length of query string is less than 1', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const search = getSearchV1('', newUser.body.token);
    expect(search.statusCode).toBe(ERROR);
  });
  test('search/v1: Failure -> Length of query string is greater than 1000', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const search = getSearchV1('abcdefghij'.repeat(101), newUser.body.token);
    expect(search.statusCode).toBe(ERROR);
  });
  test('search/v1: Success -> Successful search', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const search = getSearchV1('abcdefghij', newUser.body.token);
    expect(search.statusCode).toBe(OK);
    expect(search.body).toStrictEqual({ messages: [] });
  });
  test('search/v1: Success -> Successful search, find messages in channels', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newChannel = postChannelsCreateV3(newUser.body.token, 'Main', true);
    const newMessage = postMessageSendV1(newUser.body.token, newChannel.body.channelId, 'whazzzaaaaa');
    postMessageSendV1(newUser.body.token, newChannel.body.channelId, 'yooooo');
    const newMessage2 = postMessageSendV1(newUser.body.token, newChannel.body.channelId, 'aaaaa');
    const search = getSearchV1('aaa', newUser.body.token);
    expect(search.statusCode).toBe(OK);
    expect(search.body.messages[0].messageId).toBe(newMessage.body.messageId);
    expect(search.body.messages[0].uId).toBe(newUser.body.authUserId);
    expect(search.body.messages[0].message).toBe('whazzzaaaaa');
    expect(search.body.messages[1].messageId).toBe(newMessage2.body.messageId);
    expect(search.body.messages[1].uId).toBe(newUser.body.authUserId);
    expect(search.body.messages[1].message).toBe('aaaaa');
  });
  test('search/v1: Success -> Successful search, find messages in DMs', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('joe@gmail.com', 'password123', 'joe', 'mama');
    const newUser3 = postAuthRegister('jim@gmail.com', 'password123', 'jim', 'carrey');
    const newDM = postDmCreateV2(newUser.body.token, [newUser2.body.authUserId, newUser3.body.authUserId]);
    const newMessage = postMessageSendDmV2(newUser.body.token, newDM.body.dmId, 'whazzzaaaaa');
    postMessageSendDmV2(newUser.body.token, newDM.body.dmId, 'yooooo');
    const newMessage2 = postMessageSendDmV2(newUser2.body.token, newDM.body.dmId, 'aaaaa');
    const search = getSearchV1('aaa', newUser.body.token);
    expect(search.statusCode).toBe(OK);
    expect(search.body.messages[0].messageId).toBe(newMessage.body.messageId);
    expect(search.body.messages[0].uId).toBe(newUser.body.authUserId);
    expect(search.body.messages[0].message).toBe('whazzzaaaaa');
    expect(search.body.messages[1].messageId).toBe(newMessage2.body.messageId);
    expect(search.body.messages[1].uId).toBe(newUser2.body.authUserId);
    expect(search.body.messages[1].message).toBe('aaaaa');
  });
  test('search/v1: Success -> Successful search, find messages in DMs and channels', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('joe@gmail.com', 'password123', 'joe', 'mama');
    const newUser3 = postAuthRegister('jim@gmail.com', 'password123', 'jim', 'carrey');
    const newDM = postDmCreateV2(newUser.body.token, [newUser2.body.authUserId, newUser3.body.authUserId]);
    const newDMMessage = postMessageSendDmV2(newUser.body.token, newDM.body.dmId, 'whazzzaaaaa');
    postMessageSendDmV2(newUser.body.token, newDM.body.dmId, 'yooooo');
    const newDMMessage2 = postMessageSendDmV2(newUser2.body.token, newDM.body.dmId, 'aaaaa');
    const newChannel = postChannelsCreateV3(newUser.body.token, 'Main', true);
    const newChannelMessage = postMessageSendV1(newUser.body.token, newChannel.body.channelId, 'channel1messageaaaaa');
    postMessageSendV1(newUser.body.token, newChannel.body.channelId, 'yooooo');
    const newChannelMessage2 = postMessageSendV1(newUser.body.token, newChannel.body.channelId, 'channel2messageaaaa');
    const search = getSearchV1('aa', newUser.body.token);
    expect(search.statusCode).toBe(OK);
    expect(search.body.messages[2].messageId).toBe(newDMMessage.body.messageId);
    expect(search.body.messages[2].uId).toBe(newUser.body.authUserId);
    expect(search.body.messages[2].message).toBe('whazzzaaaaa');
    expect(search.body.messages[3].messageId).toBe(newDMMessage2.body.messageId);
    expect(search.body.messages[3].uId).toBe(newUser2.body.authUserId);
    expect(search.body.messages[3].message).toBe('aaaaa');
    expect(search.body.messages[0].messageId).toBe(newChannelMessage.body.messageId);
    expect(search.body.messages[0].uId).toBe(newUser.body.authUserId);
    expect(search.body.messages[0].message).toBe('channel1messageaaaaa');
    expect(search.body.messages[1].messageId).toBe(newChannelMessage2.body.messageId);
    expect(search.body.messages[1].uId).toBe(newUser.body.authUserId);
    expect(search.body.messages[1].message).toBe('channel2messageaaaa');
  });
});
