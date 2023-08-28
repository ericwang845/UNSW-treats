import { tokenId } from './auth';
import request from 'sync-request';
import config from './config.json';

const OK = 200;

let a1: tokenId;
let a2: tokenId;
let a3: tokenId;
let c: number;
let m: number;
let d1: number;
let m1: number;

beforeEach(() => {
  clearv1();
  a1 = authRegister('john.smith@gmail.com', 'hunter2', 'John', 'Smith').body;
  a2 = authRegister('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith').body;
  a3 = authRegister('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith').body;
  c = channelsCreateReq(a1.token, 'Channel Name', true).body.channelId;
  m = messageSendReq(a1.token, c, 'ah yeh').body.messageId;
  d1 = DMCreateReq(a1.token, [a2.authUserId, a3.authUserId]).body.dmId;
  m1 = postMessageSendDmV1(a1.token, d1, 'lol').body.messageId;
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

function postMessageSendDmV1(token: string, dmId: number, message: string) {
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
  return { body: JSON.parse(res.getBody() as string), statusCode: res.statusCode };
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

function addOwnerReq(token: string, channelId: number, uId: number) {
  try {
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
        },
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

function removeOwnerReq(token: string, channelId: number, uId: number) {
  try {
    const res = request(
      'POST',
      `${config.url}:${config.port}/channel/removeowner/v2`,
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
  } catch (err) {
    return { statusCode: err.statusCode };
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

describe('///// TESTING MESSAGE EDIT /////', () => {
  test('Success -> Channel Message is Edited', () => {
    const a = messageEditReq(a1.token, m, 'No... thats just what theyll be expecting us to do.');
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({});
  });
  test('Success -> DM Message is Edited', () => {
    const a = messageEditReq(a1.token, m1, 'No... thats just what theyll be expecting us to do.');
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({});
  });
  test('Success -> AuthUser is Global Owner', () => {
    postChannelInviteV2(a1.token, c, a2.authUserId);
    addOwnerReq(a1.token, c, a2.authUserId);
    removeOwnerReq(a1.token, c, a1.authUserId);
    const a = messageEditReq(a1.token, m, 'Its a big building where generals meet, but thats not important.');
    expect(a.statusCode).toBe(OK);
    expect(a.body).toEqual({});
  });
  test('Fail -> Invalid Token', () => {
    const a = messageEditReq('', m, 'Im doing everything I can... and stop calling me Shirley!');
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Invalid MessageId', () => {
    const a = messageEditReq(a1.token, -1, 'Looks like I picked the wrong week to quit amphetamines.');
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser Leaves Channel where Message exists', () => {
    channelLeaveReq(a1.token, c);
    const a = messageEditReq(a1.token, m, 'No, Ive been nervous lots of times.');
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser leaves DM before Message Edit', () => {
    DMLeaveReq(a1.token, d1);
    const a = messageEditReq(a1.token, m1, 'No, Ive been nervous lots of times.');
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> DM is deleted before Message Edit', () => {
    DMRemoveReq(a1.token, d1);
    const a = messageEditReq(a1.token, m1, 'No, Ive been nervous lots of times.');
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser is not the owner of DM', () => {
    const m2 = postMessageSendDmV1(a2.token, d1, 'lmao').body.messageId;
    const a = messageEditReq(a2.token, m2, 'No, Ive been nervous lots of times.');
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> AuthUser is not a user of Channel where Message exists', () => {
    const a = messageEditReq(a3.token, m, 'Yes, yes, I remember, I had lasagna.');
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser is not a user of Channel where Message exists', () => {
    const a4 = authRegister('lol.lmao@gmail.com', 'ooololoo', 'lol', 'lmao').body;
    const a = messageEditReq(a4.token, m1, 'Yes, yes, I remember, I had lasagna.');
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser is not the Original Message Author', () => {
    postChannelInviteV2(a1.token, c, a2.authUserId);
    const a = messageEditReq(a2.token, m, 'You can tell me. Im a doctor.');
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> Message Length > 1000', () => {
    const mes = 'I just want to tell you both good luck. Were all counting on you.';
    const a = messageEditReq(a1.token, m, mes.repeat(20));
    expect(a.statusCode).toBe(400);
  });
  test('Fail -> AuthUser does not have Owner Permissions in Channel where Message exists', () => {
    postChannelInviteV2(a1.token, c, a2.authUserId);
    const m2 = messageSendReq(a2.token, c, 'lol').body.messageId;
    const a = messageEditReq(a2.token, m2, 'Its a big building where generals meet, but thats not important.');
    expect(a.statusCode).toBe(403);
  });
  test('Fail -> AuthUser does not have DM Owner Permissions', () => {
    const a = messageEditReq(a3.token, m1, 'Its a big building where generals meet, but thats not important.');
    expect(a.statusCode).toBe(403);
  });
});
