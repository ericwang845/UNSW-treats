import { userProfileV1 } from './users';
import { getData, setData, typeChannel } from './dataStore';
import { tokenToAuth, isTokenValid } from './auth';
import HTTPError from 'http-errors';

const TOKEN_ERROR = HTTPError(403, 'Invalid Token');
const CHANNEL_ERROR = HTTPError(400, 'Invalid ChannelId');

function checkAuthUserId(authUserId: number) {
  const data = getData();
  if (Object.values(data.users).find((user: any) => user.userId === authUserId)) {
    return true;
  }
  return false;
}

/* Given a channel with ID channelId that the authorised user is a member of,
  provide basic details about the channel.

  Arguments:
    token:      string  - token of user calling function
    channelId:  number  - id of channel

  Return Value:
    Returns { error: 'error } ON invalid token, invalid channelId, token user
      not member of channel of channelId.
    Returns { name: string, isPublic: boolean, ownerMembers: [{ uId: number,
      email: string, nameFirst: string, nameLast: string, handleStr: string }],
      allMembers: [{ uId: number, email: string, nameFirst: string,
      nameLast: string, handleStr: string }] }
*/
function channelDetailsV2(token: string, channelId: number) {
  const data = getData();

  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  const authUserId = tokenToAuth(token);

  const channel = data.channels.find(element => element.channelId === channelId);

  // if channel doesn't exist, return error
  if (channel === undefined) {
    throw CHANNEL_ERROR;
  }

  // if authUser is not a member of channel, return error
  if (!(channel.membersId.find(element => element === authUserId))) {
    throw HTTPError(403, 'AuthUser not a member of Channel');
  }

  // initialise list of users in the channel
  const users = [];
  for (let i = 0; i < channel.membersId.length; i++) {
    users.push(userProfileV1(authUserId, channel.membersId[i]).user);
  }

  const owners = [];
  for (let i = 0; i < channel.owners.length; i++) {
    owners.push(userProfileV1(authUserId, channel.owners[i]).user);
  }
  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: owners,
    allMembers: users
  };
}

/*
  Given a channelId of a channel that the authorised user can join, adds them to that channel
  To successfully join a private channel, the authorised user must be a global owner of the channel
  To successfully join a public channel, the authorised user does not need to be a global owner
  In both cases, channelId must refer to a valid channel, and the authorised user must not already be
  a member of the channel

  Arguments:
    authUserId      (int)   - userId of the user who executed this function. Must match a userId in dataStore
                              and be a member of the channel channelId matches
    channelId       (int)   - channelId of the channel the user is attmepting to join. Must match
                              a channelId in dataStore. Channel must be public.

  Return Value:
    Returns { error: 'error' }  ON channelId not matching a channelId in dataStore
                                ON user with authUserId already a member of the channel
                                ON channel that channelId matches being private, and the authUserId not a
                                global owner
    Returns {}                  ON no error

*/

function channelJoinV2(authUserId: number, channelId: number) {
  // Check for general input errors

  const data = getData();

  // Run through the list of channels until finding the right channelId, if you cannot find it, return ERROR
  const channel = data.channels.find(channel => channel.channelId === channelId);

  let user;
  for (const email in data.users) {
    if (data.users[email].userId === authUserId) {
      user = data.users[email];
      break;
    }
  }

  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }

  // Run through the member Id's of the channel — if they are already a member, return ERROR
  for (const member of channel.membersId) {
    if (member === authUserId) {
      throw HTTPError(400, 'AuthUser is already a member of channel with Id channelId');
    }
  }

  // Allow valid users to join valid channels if they are public
  if (channel.isPublic === true) {
    channel.membersId.push(authUserId);
    const user = Object.values(data.users).find(u => u.userId === authUserId);
    user.channelsJoined.push({ numChannelsJoined: user.channelsJoined[user.channelsJoined.length - 1].numChannelsJoined + 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });

    setData(data);
    return {}; /* If it is a private channel, and the authUser is not a member and is not a globalOwner, return ERROR */
  } else {
    // Check if they are a global owner
    // If they are a global owner, then add them to the channel
    if (user.permission === 1) {
      channel.membersId.push(authUserId);
      const user = Object.values(data.users).find(u => u.userId === authUserId);
      user.channelsJoined.push({ numChannelsJoined: user.channelsJoined[user.channelsJoined.length - 1].numChannelsJoined + 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });

      setData(data);
      return {
      };
    } /* Otherwise do not let them join the channel */ else {
      throw HTTPError(403, 'Channel is private and auth user is not already a channel member and is not a global owner');
    }
  }
}

// Convert given token to ID to pass into channelDetailsV1
function channelJoinV3(token: string, channelId: number) {
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const Id = tokenToAuth(token);
  return (channelJoinV2(Id, channelId));
}

/*
  Invites a user with ID uId to join a channel with ID channelId. Once invited, the user is added to the
  channel immediately. In both public and private channels, all members are able to invite users.

  Arguments:
    authUserId    (int)   - userId of the user who executed this function. Must match a userId in dataStore
                            and be a member of the channel channelId matches
    channelId     (int)   - channelId of the channel the user is attempting to invite to. Must match
                            a channelId in dataStore
    uId           (int)   - userId of the user authUserId is attempting to invite. Must match a userId
                            in dataStore

  Return Value:
    Returns { error: 'error } ON channelId not matching a channelId in data.channels of dataStore
                              ON user with authUserId not a member of the channel that channelId matches
                              ON uId not matching a user in dataStore
                              ON uId already a member of the channel channelId matches

    Returns {}                ON no error
*/
function channelInviteV2 (authUserId: number, channelId: number, uId: number) {
  // Run through the list of channels until finding the right channelId, if you cannot find it, return ERROR
  const data = getData();

  const channel = data.channels.find((channel: typeChannel) => channel.channelId === channelId);

  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }

  // Check if uId is a valid Id, if you cannot find it, return ERROR
  if (!checkAuthUserId(uId)) {
    throw HTTPError(400, 'Invalid uId');
  }

  // Run through the members of the specified channel — if the member to be added is already a member, return ERROR
  if (channel.membersId.find(member => member === uId)) {
    throw HTTPError(400, 'Member with Id uId is already in the channel with Id channelId');
  }

  // Run through the members of the specified channel — if the authUser is not already in that channel, return error
  if (!(channel.membersId.find(member => member === authUserId))) {
    throw HTTPError(403, 'Auth user is not a member of the channel with Id channelId');
  }

  // If the authorised user is a member, then add the uId name to membersId for that channel
  channel.membersId.push(uId);
  const user = Object.values(data.users).find(u => u.userId === uId);
  user.channelsJoined.push({ numChannelsJoined: user.channelsJoined[user.channelsJoined.length - 1].numChannelsJoined + 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });

  notifyChannelJoin(authUserId, channelId, uId);
  setData(data);
  return {
  };
}

/*
  Wrapper function for channelInviteV2
*/
function channelInviteV3(token: string, channelId: number, uId: number) {
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const authUserId = tokenToAuth(token);
  return channelInviteV2(authUserId, channelId, uId);
}

/*
  Given a channel with ID channelId that the authorised user is a member of, return up to 50 messages
  between index "start" and "start + 50". Message with index 0 is the most recent message in the channel.
  This function returns a new index "end" which is the value of "start + 50", or, if this function has
  returned the least recent messages in the channel, returns -1 in "end" to indicate there are no more
  messages to load after this return.

  Arguments:
    authUserId    (int)   - userId of the user who executed this function. Must match a userId in dataStore
                            and be a member of the channel channelId matches
    channelId     (int)   - channelId of the channel the user is attempting to messages of. Must match
                            a channelId in dataStore
    start         (int)   - startng index for the messages array of the channel

  Return Value:
    Returns { error: 'error' }  ON channelId not matching a channelId in dataStore
                                ON user with authUserId not a member of the channel that channelId matches
                                ON start index greater than or equal to length of messages array

    Returns {
      messages:   [{
        messageId:  (int)     unique id of message
        uId:        (int)     userId of user who sent the message
        message:    (string)  contents of the message
        timeSent:   (time)    time at which message was sent
      }]
      start:        (int)     start index for the messages array of the channel
      end:          (int)     index of the last message pushed to "messages" return array
                              -1, if the oldest message of the channel was pushed
                              start + 50, if the oldest message of the channel was not pushed,
    }
*/
function channelMessagesV1(authUserId: number, channelId: number, start: number) {
  const data = getData();

  if (!isChannelValid(channelId)) {
    throw CHANNEL_ERROR;
  }

  const channel = data.channels.find(c => (c.channelId === channelId) && (c.membersId.includes(authUserId)));
  if (channel === undefined) {
    throw HTTPError(403, 'AuthUser not a member of Channel');
  }

  // EDGE CASE: if channel.messages is empty, return empty messages array
  if (channel.messages.length === 0) {
    if (start === 0) {
      return {
        messages: [],
        start: start,
        end: -1
      };
    }

    throw HTTPError(400, 'Start Index is greater than the no of Messages in Channel');
  }

  // if start index overflows message array, return ERROR
  if (start >= channel.messages.length) {
    throw HTTPError(400, 'Start Index is greater than the no of Messages in Channel');
  }

  let end = start + 50;
  // initialise array of messages reversed
  const temp = [...channel.messages].reverse();
  // paginate up to 50 messages
  const messages = temp.slice(start, end);
  // initialise end index to -1 if the oldest message is paginated
  if (messages[messages.length - 1].messageId === channel.messages[0].messageId) {
    end = -1;
  }

  return {
    messages: messages,
    start: start,
    end: end,
  };
}

/*
  Wrapper function for channelMessagesV1
*/
function channelMessagesV2(token: string, channelId: number, start: number) {
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  return channelMessagesV1(tokenToAuth(token), channelId, start);
}

/*  Given a channel with ID channelId that the authorised user is a member of,
  remove them as a member of the channel. Their messages should remain in the
  channel. If the only channel owner leaves, the channel will remain.

  Arguments:
    token:      string  - token of user calling function
    channelId:  number  - id of channel

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid channelId, token user
      not a member of channel of channelId
    Returns { } ON no error.
*/
function channelLeaveV1(token: string, channelId: number) {
  const data = getData();

  // check if token exists, or channel with channelId exists
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  if (!isChannelValid(channelId)) {
    throw CHANNEL_ERROR;
  }

  const channel = data.channels.find((element: typeChannel) => element.channelId === channelId);
  if (tokenToAuth(token) === channel.standUp.standUpSenderId) {
    throw HTTPError(400, 'AuthUser currently leading a StandUp');
  }
  const index = channel.membersId.indexOf(tokenToAuth(token));

  // check if user with token / authUserId is a member of channel, if so remove them from channel membersId array
  if (index === -1) {
    throw HTTPError(403, 'AuthUser not a member of Channel');
  }
  channel.membersId.splice(index, 1);

  // check if user is an owner, if so remove them from owners array
  const ownerIndex = channel.owners.indexOf(tokenToAuth(token));
  if (ownerIndex !== -1) {
    channel.owners.splice(ownerIndex, 1);
  }
  const user = Object.values(data.users).find(u => u.userId === tokenToAuth(token));
  user.channelsJoined.push({ numChannelsJoined: user.channelsJoined[user.channelsJoined.length - 1].numChannelsJoined - 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });

  return {};
}

/*  Make user with user id uId an owner of the channel.

  Arguments:
    token:      string  - token of user calling function
    channelId:  number  - id of channel
    uId:        number  - id of user to add

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid channelId, invalid uId,
     uId not a member of channel, uId already an owner of channel,
     token user not a member of channel of channelId, token user does not have
     owner permissions.
    Returns { } ON no error.
*/
function channelAddownerV1(token: string, channelId: number, uId: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  if (!isChannelValid(channelId)) {
    throw CHANNEL_ERROR;
  }
  if (!isUserOwner(tokenToAuth(token), channelId) && !(data.globalOwner.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser does not have Owner Permissions in Channel');
  }
  if (!checkAuthUserId(uId)) {
    throw HTTPError(400, 'Invalid UserId');
  }
  if (isUserOwner(uId, channelId)) {
    throw HTTPError(400, 'UserId already an Owner of Channel');
  }
  if (!isUserInChannel(uId, channelId)) {
    throw HTTPError(400, 'UserId not a member of Channel');
  }

  data.channels.find(c => c.channelId === channelId).owners.push(uId);
  setData(data);
  return {};
}

/*  Remove user with user id uId as an owner of the channel.

  Arguments:
    token:      string  - token of user calling function
    channelId:  number  - id of channel
    uId:        number  - id of user to add

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid channelId, invalid uId,
     uId not an owner of channel, uId is the sole owner of channel,
     token user not a member of channel of channelId, token user does not have
     owner permissions.
    Returns { } ON no error.
*/
function channelRemoveOwnerV1(token: string, channelId: number, uId: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  if (!isChannelValid(channelId)) {
    throw CHANNEL_ERROR;
  }
  if (!isUserOwner(tokenToAuth(token), channelId) && !(data.globalOwner.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser does not have Owner Permissions in Channel');
  }
  if (!checkAuthUserId(uId)) {
    throw HTTPError(400, 'Invalid UserId');
  }
  if (!isUserOwner(uId, channelId) || !isUserInChannel(uId, channelId)) {
    throw HTTPError(400, 'UserId is not an Owner or Member of Channel');
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (channel.owners.length === 1) {
    throw HTTPError(400, 'Channels cannot have 0 Owners');
  }

  channel.owners.splice(channel.owners.indexOf(uId), 1);
  setData(data);
  return {};
}

/*
  Checks if user of uId is in channel of channelId
*/
function isUserInChannel(uId: number, channelId: number) {
  const data = getData();
  return data.channels.find(c => c.channelId === channelId).membersId.includes(uId);
}

/*
  Checks if user of uId is an owner of channel of channelId
*/
function isUserOwner(uId: number, channelId: number) {
  const data = getData();
  return data.channels.find(c => c.channelId === channelId).owners.includes(uId);
}

/*
  Checks if the passed in channelId exists in datastore
*/
function isChannelValid(channelId: number) {
  const data = getData();
  const channel = data.channels.find((channel: typeChannel) => channel.channelId === channelId);
  if (channel === undefined) {
    return false;
  }
  return true;
}

/**
 * Notifies user of uId of the authUser inviting them to a channel
 * @param authUserId
 * @param channelId
 * @param uId
 */
function notifyChannelJoin(authUserId: number, channelId: number, uId: number) {
  const data = getData();
  const user = Object.values(data.users).find(u => u.userId === uId);
  const channel = data.channels.find(c => c.channelId === channelId);
  const authUser = Object.values(data.users).find(u => u.userId === authUserId);
  user.notifications.push({ channelId: channelId, dmId: -1, notificationMessage: `${authUser.userHandle} added you to ${channel.name}` });
}

export {
  channelDetailsV2, channelMessagesV1, channelLeaveV1,
  isChannelValid, channelAddownerV1, channelRemoveOwnerV1, channelJoinV3, channelInviteV3,
  isUserInChannel, isUserOwner, channelMessagesV2
};
