import { isTokenValid, tokenToAuth } from './auth';
import { isChannelValid, isUserInChannel } from './channel';
import { getData, setData, typeChannel, typeDM, typeMessage } from './dataStore';
import HTTPError from 'http-errors';
import { isDMIdValid } from './dm';

const TOKEN_ERROR = HTTPError(403, 'Invalid Token');
const CHANNEL_ERROR = HTTPError(400, 'Invalid ChannelId');
const DM_ERROR = HTTPError(400, 'Invalid DmId');

/*  Send a message from the authorised user to the channel specified by
  channelId. Note: Each message should have its own unique ID, i.e. no messages
  should share an ID with another message, even if that other message is in a
  different channel.

  Arguments:
    token:      string  - token of user calling function
    channelId:  number  - id of channel
    message:    string  - message to be sent

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid channelId, message
      length < 1 or > 1000, token user is not member of channel
    Returns { messageId: number } ON no error.
*/
function messageSendV1(token: string, channelId: number, message: string) {
  const data = getData();

  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  if (!isChannelValid(channelId)) {
    throw CHANNEL_ERROR;
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (!(channel.membersId.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser is not a member of the channel');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  // initialise new unique messageId
  let messageId: number;
  if (data.messageIds.length === 0) {
    messageId = 1;
  } else {
    messageId = data.messageIds[data.messageIds.length - 1] + 1;
  }

  data.messageIds.push(messageId);
  channel.messages.push({
    messageId: messageId,
    uId: tokenToAuth(token),
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }],
    isPinned: false,
  });

  // update user stats of messages sent and workspace stats of existing messages
  updateMessageStats(token, 1);
  notifyMessage(message, channelId, -1);
  setData(data);
  return {
    messageId: messageId,
  };
}

/*  Given a message, update its text with new text. If the new message is an
  empty string, the message is deleted.

  Arguments:
    token:      string  - token of user calling function
    messageId:  number  - id of message
    message:    string  - message to replace existing message

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid messageId, message
      length > 1000, token user is not member of channel, messageId is in, user
      is not the original sender of the messageId, user does not have owner
      permissions in the channel
    Returns { } ON no error.
*/
function messageEditV1(token: string, messageId: number, message: string) {
  const data = getData();
  // if (data.messageIds[0] === undefined) {
  //   data.messageIds = [];
  // }
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  const originalMessage = getMessage(token, messageId);
  if (originalMessage === undefined) {
    throw HTTPError(400, 'MessageId does not exist in Channels Or DMS AuthUser has joined');
  }
  if (originalMessage.uId !== tokenToAuth(token)) {
    throw HTTPError(403, 'AuthUser is not the original Author of the message');
  }

  const d = data.DMS.find(d => d.messages.some(m => m.messageId === messageId));
  const c = data.channels.find(c => c.messages.some(m => m.messageId === messageId));

  if (d === undefined) {
    if (!(c.owners.includes(tokenToAuth(token))) && !(data.globalOwner.includes(tokenToAuth(token)))) {
      throw HTTPError(403, 'AuthUser is not an Owner of the Channel');
    }
  } else if (d.owner !== tokenToAuth(token)) {
    throw HTTPError(403, 'AuthUser is not an Owner of the DM');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  // if the messageId exists in a channel, else messageId exists in Dm
  if (c !== undefined) {
    if (message.length === 0) {
      c.messages.splice(c.messages.indexOf(originalMessage), 1);

      // update messageId array to account for message removal and workspace stats
      // of no of existing messages
      data.messageIds.splice(data.messageIds.indexOf(messageId), 1);
      updateMessageStats(token, -1);
    } else {
      originalMessage.message = message;
      notifyMessage(originalMessage.message, c.channelId, -1);
    }
  } else {
    if (message.length === 0) {
      d.messages.splice(d.messages.indexOf(originalMessage), 1);

      // update messageId array to account for message removal and workspace stats
      // of no of existing messages
      data.messageIds.splice(data.messageIds.indexOf(messageId), 1);
      updateMessageStats(token, -1);
    } else {
      originalMessage.message = message;
      notifyMessage(originalMessage.message, -1, d.dmId);
    }
  }
  setData(data);
  return {};
}

/*  Given a messageId for a message, this message is removed from the channel/DM

  Arguments:
    token:      string  - token of user calling function
    messageId:  number  - id of message

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid messageId, token user
      is not member of channel, messageId is in, user is not the original sender
      of the messageId, user does not have owner permissions in the channel
    Returns { } ON no error.
*/
function messageRemoveV1(token: string, messageId: number) {
  return messageEditV1(token, messageId, '');
}

/**
 * ogMessageId is the ID of the original message. channelId is the channel that the
 * message is being shared to, and is -1 if it is being sent to a DM. dmId is the DM
 * that the message is being shared to, and is -1 if it is being sent to a channel.
 * message is the optional message in addition to the shared message, and will be an
 * empty string '' if no message is given.
 *
 * Arguments:
 *  token:      string  - token of authUser
 *  ogmessageId:number  - id of message to be shared
 *  message:    string  - extra message contents
 *  channelId:  number  - id of recipient channel, -1 if Dm
 *  dmId:       number  - id of recipient Dm, -1 if channel
 *
 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token, authUser not a member of
 *   recipient channel or Dm,
 *          { statusCode: 400 } ON invalid channelId, invalid DmId, neither
 *   channelId or dmId is -1, ogmessageId does not refer to a message in channels
 *   or dms AuthUser has joined, message length > 1000.
 *  Returns { sharedMessageId } On no Error
 */
function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  if (channelId === -1 && dmId === -1) {
    throw HTTPError(400, 'Either ChannelId or DMId must not equal -1');
  }
  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'Either ChannelId or DMId must be equal to -1');
  }

  if (!isChannelValid(channelId) && channelId !== -1) {
    throw CHANNEL_ERROR;
  }
  if (!isDMIdValid(dmId) && dmId !== -1) {
    throw DM_ERROR;
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Message Length over 1000 characters');
  }

  const ogMessage = getMessage(token, ogMessageId);
  if (ogMessage === undefined) {
    throw HTTPError(400, 'MessageId does not exist in Channels Or DMS AuthUser has joined');
  }

  // initialise string with OGmessage and extra message
  const sharedMessage = ogMessage.message + message;
  const data = getData();
  const messageId = data.messageIds[data.messageIds.length - 1] + 1;

  // if the messageShare is directed towards a channel, else messageShare is directed towards a DM
  if (channelId !== -1) {
    const channel = data.channels.find(c => c.channelId === channelId && c.membersId.includes(tokenToAuth(token)));
    if (channel === undefined) {
      throw HTTPError(403, 'AuthUser not a member of Channel');
    }
    channel.messages.push({
      messageId: messageId,
      uId: tokenToAuth(token),
      message: sharedMessage,
      timeSent: Math.floor((new Date()).getTime() / 1000),
      reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }],
      isPinned: false
    });
  } else {
    const dm = data.DMS.find(d => d.dmId === dmId && d.members.includes(tokenToAuth(token)));
    if (dm === undefined) {
      throw HTTPError(403, 'AuthUser not a member of DM');
    }
    dm.messages.push({
      messageId: messageId,
      uId: tokenToAuth(token),
      message: sharedMessage,
      timeSent: Math.floor((new Date()).getTime() / 1000),
      reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }],
      isPinned: false
    });
  }
  data.messageIds.push(messageId);
  notifyMessage(sharedMessage, channelId, dmId);
  setData(data);
  return { sharedMessageId: messageId };
}

/**
 * Send a message from the authorised user to the channel specified by channelId
 * automatically at a specified time in the future. The returned messageId will
 * only be considered valid for other actions (editing/deleting/reacting/etc)
 * once it has been sent (i.e. after timeSent).
 *
 * Arguments:
 *  token:      string  - token of authUser
 *  channelId:  number  - id of recipient Channel
 *  message:    string  - message contents
 *  timeSent:   number  - time to Send
 *
 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token, authUser not a member of
 *   recipient channel,
 *          { statusCode: 400 } ON invalid channelId, message length < 1 or
 *   > 1000, timeSent is in the past
 *  Returns { messageId } On no Error
 */
function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  if (!isChannelValid(channelId)) {
    throw CHANNEL_ERROR;
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Message length less than 1 or greater than 1000');
  }
  if (!isUserInChannel(tokenToAuth(token), channelId)) {
    throw HTTPError(403, 'AuthUser not a Member of Channel');
  }
  if (Math.floor((new Date()).getTime() / 1000) > timeSent) {
    throw HTTPError(400, 'Time set for Message to Send must be in the Future');
  }

  const data = getData();

  // initialise messageId
  let messageId: number;
  if (data.messageIds.length === 0) {
    data.messageIds = [];
    messageId = 1;
  } else {
    messageId = data.messageIds[data.messageIds.length - 1] + 1;
  }

  data.messageIds.push(messageId);

  // number of ms needed to transpire before the message is sent
  const timeDiff = timeSent - Math.floor((new Date()).getTime() / 1000);

  // Callback function is not executed until the timeDiff transpires
  setTimeout(() => {
    const channel = data.channels.find(c => c.channelId === channelId);
    channel.messages.push({
      messageId: messageId,
      uId: tokenToAuth(token),
      message: message,
      timeSent: timeSent,
      reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }],
      isPinned: false,
    });

    // update authUser user stats of no of messages sent and workspace stats of
    // no of existing messages.
    updateMessageStats(token, 1);
    notifyMessage(message, channelId, -1);
    setData(data);
  }, timeDiff);

  // messageId is returned, however the message is not sent until the timeDiff transpires
  return { messageId: messageId };
}

/**
 * Send a message from the authorised user to the DM specified by dmId automatically
 * at a specified time in the future. The returned messageId will only be considered
 * valid for other actions (editing/deleting/reacting/etc) once it has been sent
 * (i.e. after timeSent). If the DM is removed before the message has sent, the
 * message will not be sent.
 *
 * Arguments:
 *  token:      string  - token of authUser
 *  dmId:       number  - id of recipient DM
 *  message:    string  - message contents
 *  timeSent:   number  - time to Send
 *
 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token, authUser not a member of
 *   recipient Dm,
 *          { statusCode: 400 } ON invalid Dm, message length < 1 or
 *   > 1000, timeSent is in the past
 *  Returns { messageId } On no Error
 */
function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  if (!isDMIdValid(dmId)) {
    throw DM_ERROR;
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Message length less than 1 or greater than 1000');
  }
  if (!(data.DMS.some(d => d.dmId === dmId && d.members.includes(tokenToAuth(token))))) {
    throw HTTPError(403, 'AuthUser not a member of DM');
  }
  if (Math.floor((new Date()).getTime() / 1000) > timeSent) {
    throw HTTPError(400, 'Time set for Message to Send must be in the Future');
  }

  // initialise messageId
  let messageId: number;
  if (data.messageIds.length === 0) {
    data.messageIds = [];
    messageId = 1;
  } else {
    messageId = data.messageIds[data.messageIds.length - 1] + 1;
  }

  data.messageIds.push(messageId);

  // number of ms needed to transpire before the message is sent
  const timeDiff = timeSent - Math.floor((new Date()).getTime() / 1000);

  // Callback function is not executed until the timeDiff transpires
  setTimeout(() => {
    const dm = data.DMS.find(d => d.dmId === dmId);
    if (dm === undefined) {
      return;
    }
    dm.messages.push({
      messageId: messageId,
      uId: tokenToAuth(token),
      message: message,
      timeSent: timeSent,
      reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }],
      isPinned: false,
    });

    // update authUser user stats of no of messages sent and workspace stats of
    // no of existing messages.
    updateMessageStats(token, 1);
    notifyMessage(message, -1, dmId);
    setData(data);
  }, timeDiff);

  // messageId is returned, however the message is not sent until the timeDiff transpires
  return { messageId: messageId };
}

/**
 * Given a message within a channel or DM the authorised user is part of, add a
 * "react" to that particular message.
 *
 * Arguments:
 *  token:      string  - token of authUser
 *  message:    string  - message contents
 *  reactId:    number  - id of react
 *
 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token
 *          { statusCode: 400 } ON invalid messageId, AuthUser has not joined
 *   channel or Dm, invalid reactId, AuthUser has already reacted message
 *  Returns { } On no Error
 */
function messageReactV1(token: string, messageId: number, reactId: number) {
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  const message = getMessage(token, messageId);
  if (message === undefined) {
    throw HTTPError(400, 'MessageId does not exist in Channels Or DMS AuthUser has joined');
  }
  if (!(message.reacts.some(r => r.reactId === reactId))) {
    throw HTTPError(400, 'ReactId does not exist');
  }
  const reacts = message.reacts.find(r => r.reactId === reactId);
  if (reacts.uIds.includes(tokenToAuth(token))) {
    throw HTTPError(400, 'AuthUser has already reacted');
  }

  reacts.uIds.push(tokenToAuth(token));
  return {};
}

/**
 * Given a message within a channel or DM the authorised user is part of, remove
 * a "react" to that particular message.
 *
 * Arguments:
 *  token:      string  - token of authUser
 *  message:    string  - message contents
 *  reactId:    number  - id of react
 *
 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token
 *          { statusCode: 400 } ON invalid messageId, AuthUser has not joined
 *   channel or Dm, invalid reactId, AuthUser has not reacted to message
 *  Returns { } On no Error
 */
function messageUnreactV1(token: string, messageId: number, reactId: number) {
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  const message = getMessage(token, messageId);
  if (message === undefined) {
    throw HTTPError(400, 'MessageId does not exist in Channels Or DMS AuthUser has joined');
  }
  if (!(message.reacts.some(r => r.reactId === reactId))) {
    throw HTTPError(400, 'ReactId does not exist');
  }
  const reacts = message.reacts.find(r => r.reactId === reactId);
  if (!(reacts.uIds.includes(tokenToAuth(token)))) {
    throw HTTPError(400, 'AuthUser has not reacted to Message');
  }

  reacts.uIds.splice(reacts.uIds.indexOf(tokenToAuth(token)), 1);
  return {};
}

/**
 * Given a message within a channel or DM, mark it as "pinned".
 *
 * Arguments:
 *  token:      string  - token of authUser
 *  messageId:  number  - id of message to be pinned
 *
 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token, AuthUser does not have owner
 *   permissions
 *          { statusCode: 400 } ON invalid messageId, AuthUser has not joined
 *   channel or Dm, message already pinned
 *  Returns { } On no Error
 */
function messagePinV1(token: string, messageId: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  const message = getMessage(token, messageId);
  if (message === undefined) {
    throw HTTPError(400, 'MessageId does not exist in Channels Or DMS AuthUser has joined');
  }
  const d = data.DMS.find(d => d.messages.some(m => m.messageId === messageId));
  const c = data.channels.find(c => c.messages.some(m => m.messageId === messageId));

  if (d === undefined) {
    if (!(c.owners.includes(tokenToAuth(token))) && !(data.globalOwner.includes(tokenToAuth(token)))) {
      throw HTTPError(403, 'AuthUser is not an Owner of the Channel');
    }
  } else if (d.owner !== tokenToAuth(token)) {
    throw HTTPError(403, 'AuthUser is not an Owner of the DM');
  }
  if (message.isPinned) {
    throw HTTPError(400, 'Message is already Pinned');
  }
  message.isPinned = true;
  return {};
}

/**
 * Given a message within a channel or DM, remove its mark as "pinned".
 *
 * Arguments:
 *  token:      string  - token of authUser
 *  messageId:  number  - id of message to be pinned
 *
 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token, AuthUser does not have owner
 *   permissions
 *          { statusCode: 400 } ON invalid messageId, AuthUser has not joined
 *   channel or Dm, message not pinned
 *  Returns { } On no Error
 */
function messageUnpinV1(token: string, messageId: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  const message = getMessage(token, messageId);
  if (message === undefined) {
    throw HTTPError(400, 'MessageId does not exist in Channels Or DMS AuthUser has joined');
  }
  const d = data.DMS.find(d => d.messages.some(m => m.messageId === messageId));
  const c = data.channels.find(c => c.messages.some(m => m.messageId === messageId));

  if (d === undefined) {
    if (!(c.owners.includes(tokenToAuth(token))) && !(data.globalOwner.includes(tokenToAuth(token)))) {
      throw HTTPError(403, 'AuthUser is not an Owner of the Channel');
    }
  } else if (d.owner !== tokenToAuth(token)) {
    throw HTTPError(403, 'AuthUser is not an Owner of the DM');
  }
  if (!(message.isPinned)) {
    throw HTTPError(400, 'Message is already Unpinned');
  }
  message.isPinned = false;
  return {};
}

/*
  Returns the Channel or DM the messageId exists in
*/
function getMessage(token: string, messageId: number) {
  const data = getData();
  const authUserId = tokenToAuth(token);
  let messageLocation: typeChannel | typeDM;
  let message: typeMessage;
  if ((messageLocation = data.DMS.find(d => d.messages.some(m => m.messageId === messageId) && d.members.includes(authUserId))) !== undefined) {
    message = messageLocation.messages.find(m => m.messageId === messageId);
  } else if ((messageLocation = data.channels.find(c => c.messages.some(m => m.messageId === messageId) && c.membersId.includes(authUserId))) !== undefined) {
    message = messageLocation.messages.find(m => m.messageId === messageId);
  }

  return message;
}

/**
 * Notifies any @handles in message
 * @param message
 * @param channelId
 * @param dmId
 * @returns void
 */
function notifyMessage(message: string, channelId: number, dmId: number) {
  if (!message.includes('@')) {
    return;
  }

  const data = getData();
  const regExp = /(@)\w+/g;
  const duplicate: Array<string> = [];

  // for each tagged user in the message
  for (let i = regExp.exec(message); i !== null; i = regExp.exec(message)) {
    const handle = String(i[0].slice(1));
    const user = Object.values(data.users).find(u => u.userHandle === handle);

    // prevent duplicate notifications
    if (duplicate.includes(handle) || user === undefined) {
      continue;
    }

    // if message exists in channel, else message exists in dm
    if (channelId !== -1) {
      const channel = data.channels.find(c => c.channelId === channelId);
      if (channel.membersId.includes(user.userId)) {
        user.notifications.push({ channelId: channelId, dmId: -1, notificationMessage: `${handle} tagged you in ${channel.name}: ${message.slice(0, 20)}` });
      }
    } else {
      const dm = data.DMS.find(d => d.dmId === dmId);
      if (dm.members.includes(user.userId)) {
        user.notifications.push({ channelId: -1, dmId: dmId, notificationMessage: `${handle} tagged you in ${dm.name}: ${message.slice(0, 20)}` });
      }
    }
    duplicate.push(handle);
  }
  setData(data);
}

/**
 * Updates user and Treats Workspace message stats by value of incremement
 * @param token
 * @param increment
 */
function updateMessageStats(token: string, increment: number) {
  const data = getData();

  // user messagesSent stats can only increase
  if (increment > 0) {
    const user = Object.values(data.users).find(u => u.userId === tokenToAuth(token));
    user.messagesSent.push({ numMessagesSent: user.messagesSent[user.messagesSent.length - 1].numMessagesSent + increment, timeStamp: Math.floor((new Date()).getTime() / 1000) });
  }
  data.messagesExist.push({ numMessagesExist: data.messagesExist[data.messagesExist.length - 1].numMessagesExist + increment, timeStamp: Math.floor((new Date()).getTime() / 1000) });
}

export {
  messageEditV1, messageRemoveV1, messageSendV1, messageShareV1, messageSendLaterV1,
  messageSendLaterDmV1, notifyMessage, messageReactV1, messageUnreactV1, messagePinV1,
  messageUnpinV1, updateMessageStats
};
