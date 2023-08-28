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

// Wrapper function to send messages to a DM
function postMessageSendDmV1(token: string, dmId: number, message: string) {
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

// Wrapper function for displying the messages in a DM
function getDMMessagesReq(token: string, dmId: number, start: number) {
  try {
    const res = request(
      'GET',
        `${config.url}:${config.port}/dm/messages/v2`,
        {
          qs: {
            dmId: dmId,
            start: start,
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

// Wrapper function to provide details about a DM
function getDMDetailsReq(token: string, dmId: number) {
  try {
    const res = request(
      'GET',
        `${config.url}:${config.port}/dm/details/v2`,
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
function postMessageSendV2(token: string, channelId: number, message: string) {
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

// Wrapper function to list messages in a channel
function getChannelMessagesReq(token:string, channelId: number, start: number) {
  try {
    const res = request(
      'GET',
            `${config.url}:${config.port}/channel/messages/v3`,
            {
              qs: {
                channelId: channelId,
                start: start,
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

// Wrapper function to remove a user from treats
function deleteAdminUserRemoveV1(uId: number, token: string) {
  const res = request(
    'DELETE',
    `${url}:${port}/admin/user/remove/v1`,
    {
      qs: {
        uId: uId,
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

// Wrapper function to join channels
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

// Wrapper function to send user profile request
function userProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}/user/profile/v3`,
    {
      qs: {
        uId: uId,
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

// Wrapper function to display channel details
function channelDetailsReq(token: string, channelId: number) {
  try {
    const res = request(
      'GET',
      `${url}:${port}/channel/details/v3`,
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

describe('Testing admin/user/remove/v1', () => {
  test('admin/user/remove/v1: Failure -> invalid token', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const userRemove = deleteAdminUserRemoveV1(newUser.body.authUserId, newUser.body.token + newUser2.body.token);
    expect(userRemove.statusCode).toBe(AUTH_ERROR);
  });
  test('admin/user/remove/v1: Failure -> uId does not refer to a valid user', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const userRemove = deleteAdminUserRemoveV1(newUser.body.authUserId + newUser2.body.authUserId, newUser.body.token);
    expect(userRemove.statusCode).toBe(ERROR);
  });
  test('admin/user/remove/v1: Failure -> uId refers to a user who is the only global owner', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const userRemove = deleteAdminUserRemoveV1(newUser.body.authUserId, newUser2.body.token);
    expect(userRemove.statusCode).toBe(ERROR);
  });
  test('admin/user/remove/v1: Failure -> the authorised user is not a global owner', () => {
    postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newUser3 = postAuthRegister('joe@gmail.com', 'password123', 'joe', 'mama');
    const userRemove = deleteAdminUserRemoveV1(newUser3.body.authUserId, newUser2.body.token);
    expect(userRemove.statusCode).toBe(AUTH_ERROR);
  });
  test('admin/user/remove/v1: Success -> Removed user successfully', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, check for removing DM messages', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newDM = postDmCreateV1(newUser.body.token, [newUser2.body.authUserId]);
    postMessageSendDmV1(newUser.body.token, newDM.body.dmId, 'Miaowww');
    postMessageSendDmV1(newUser2.body.token, newDM.body.dmId, 'Woooof');
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    const displayMessages = getDMMessagesReq(newUser.body.token, newDM.body.dmId, 0);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    expect(displayMessages.body.messages[0].message).toStrictEqual('Removed user');
    expect(displayMessages.body.messages[1].message).toStrictEqual('Miaowww');
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, check for removing multiple DM messages', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newDM = postDmCreateV1(newUser.body.token, [newUser2.body.authUserId]);
    postMessageSendDmV1(newUser.body.token, newDM.body.dmId, 'Miaowww');
    postMessageSendDmV1(newUser2.body.token, newDM.body.dmId, 'Woooof');
    postMessageSendDmV1(newUser.body.token, newDM.body.dmId, 'Threeee');
    postMessageSendDmV1(newUser2.body.token, newDM.body.dmId, 'Fourrrr');
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    const displayMessages = getDMMessagesReq(newUser.body.token, newDM.body.dmId, 0);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    expect(displayMessages.body.messages[0].message).toStrictEqual('Removed user');
    expect(displayMessages.body.messages[1].message).toStrictEqual('Threeee');
    expect(displayMessages.body.messages[2].message).toStrictEqual('Removed user');
    expect(displayMessages.body.messages[3].message).toStrictEqual('Miaowww');
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, check that user has been removed from DM', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newUser3 = postAuthRegister('joe@gmail.com', 'password123', 'joe', 'mama');
    const newDM = postDmCreateV1(newUser.body.token, [newUser2.body.authUserId, newUser3.body.authUserId]);
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    const DMDetails = getDMDetailsReq(newUser.body.token, newDM.body.dmId);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    expect(DMDetails.body.members.length).toBe(2);
    expect(DMDetails.body.members).toStrictEqual([
      {
        uId: newUser3.body.authUserId,
        email: 'joe@gmail.com',
        nameFirst: 'joe',
        nameLast: 'mama',
        handleStr: 'joemama',
        profileImgUrl: expect.any(String),
      },
      {
        uId: newUser.body.authUserId,
        email: 'billybob242@gmail.com',
        nameFirst: 'global',
        nameLast: 'owner',
        handleStr: 'globalowner',
        profileImgUrl: expect.any(String),
      }
    ]);
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, check for removing channel message', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newChannel = postChannelsCreateV3(newUser.body.token, 'Main', true);
    postChannelJoinV3(newUser2.body.token, newChannel.body.channelId);
    postMessageSendV2(newUser.body.token, newChannel.body.channelId, 'Miaowww');
    postMessageSendV2(newUser2.body.token, newChannel.body.channelId, 'Woooof');
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    const displayMessages2 = getChannelMessagesReq(newUser.body.token, newChannel.body.channelId, 0);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    expect(displayMessages2.body.messages[0].message).toStrictEqual('Removed user');
    expect(displayMessages2.body.messages[1].message).toStrictEqual('Miaowww');
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, check for removing multiple channel message', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newChannel = postChannelsCreateV3(newUser.body.token, 'Main', true);
    postChannelJoinV3(newUser2.body.token, newChannel.body.channelId);
    postMessageSendV2(newUser.body.token, newChannel.body.channelId, 'Miaowww');
    postMessageSendV2(newUser2.body.token, newChannel.body.channelId, 'Woooof');
    postMessageSendV2(newUser.body.token, newChannel.body.channelId, 'Threeeee');
    postMessageSendV2(newUser2.body.token, newChannel.body.channelId, 'Fourrrr');
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    const displayMessages2 = getChannelMessagesReq(newUser.body.token, newChannel.body.channelId, 0);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    expect(displayMessages2.body.messages[0].message).toStrictEqual('Removed user');
    expect(displayMessages2.body.messages[1].message).toStrictEqual('Threeeee');
    expect(displayMessages2.body.messages[2].message).toStrictEqual('Removed user');
    expect(displayMessages2.body.messages[3].message).toStrictEqual('Miaowww');
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, check that user has been removed from channel', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const newChannel = postChannelsCreateV3(newUser.body.token, 'Main', true);
    postChannelJoinV3(newUser2.body.token, newChannel.body.channelId);
    const channelDetails = channelDetailsReq(newUser.body.token, newChannel.body.channelId);
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    const channelDetails2 = channelDetailsReq(newUser.body.token, newChannel.body.channelId);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    expect(channelDetails.body.allMembers.length).toStrictEqual(2);
    expect(channelDetails2.body.allMembers.length).toStrictEqual(1);
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, checking with user profile that their name has been changed to Removed user', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    const profile = userProfile(newUser.body.token, newUser2.body.authUserId);
    expect(profile.body.user.nameFirst).toBe('Removed');
    expect(profile.body.user.nameLast).toBe('user');
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, checking that the removed users email can be reused', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    const newUser3 = postAuthRegister('jeff@gmail.com', 'password123', 'first', 'last');
    expect(newUser3.statusCode).toBe(OK);
  });
  test('admin/user/remove/v1: Success -> Removed user successfully, checking that the removed users handle can be reused', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const newUser2 = postAuthRegister('jeff@gmail.com', 'password123', 'nem', 'jeff');
    const userRemove = deleteAdminUserRemoveV1(newUser2.body.authUserId, newUser.body.token);
    expect(userRemove.statusCode).toBe(OK);
    expect(userRemove.body).toStrictEqual({});
    const newUser3 = postAuthRegister('email@gmail.com', 'password123', 'nem', 'jeff');
    expect(newUser3.statusCode).toBe(OK);
  });
});
