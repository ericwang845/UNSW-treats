// ========================================== imports  ========================================= //

import { typeChannel, typeActive } from './dataStore';
import { getData, setData } from './dataStore';
import { tokenToAuth } from './auth';
import HTTPError from 'http-errors';
import { notifyMessage } from './message';

// ========================================= functions ========================================= //

/* This function starts a stand up session in a specific channel.

  channel format (with standup details):
  {
    name:       (string)  name of channel,
    authUserId: (int)     userId of user who created channel,
    membersId:  ([int])   userIds array of users in channel,
    channelId:  (int)     unique id,
    isPublic:   (boolean) false = private, true = public
    messages:   ([message object]) array of messages sent in the channel
    standupStatus: (boolean) false = inactive, true = active
    standupEndTime: (string) date format
  }

  Arguments:
    channelId     (number) - id of the channel in which the standup session starts
    length        (number) - the length of a standup session
    token         (string) - tokenId of the user who starts the standup session

  Return Value:
    Returns { HTTPError 400 } ON invalid channelId, if standup session is already active, negative length
    Returns { HTTP Error 403 } ON valid channelId but user who starts the standup session is not part of the channel
    Returns { timeFinish: endTime } ON no errors
*/

export function standUpStart(token: string, channelId: number, length: number) {
  // convert length into seconds

  // get the data
  const data = getData();
  const channel = data.channels.find((channel: typeChannel) => channel.channelId === channelId);

  // 400 Errors:
  if (channel === undefined) throw HTTPError(400, 'Invalid channelId!');
  if (channel.standUp.standUpStatus === true) throw HTTPError(400, 'StandUp is already active!');
  if (length < 0) throw HTTPError(400, 'Time length cannot be negative!');

  // 403 Errors:
  if (!(channel.membersId.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser is not a member of the channel');
  }

  // ========================================================================================================= //

  // 1. Activate the standup
  channel.standUp.standUpStatus = true;
  channel.standUp.standUpMessageId = data.messageIds[data.messageIds.length - 1] + 1;
  channel.standUp.standUpSenderId = tokenToAuth(token);
  setData(data);

  // 2. Get the StartTime and EndTime (in seconds)
  const currentTime = getTimeStamp();
  const endTime = currentTime + length;

  // 3. Update the standupFinish time
  channel.standUp.standUpEndTime = endTime;
  console.log(`Standup starts now, will end in ${length} seconds at ${channel.standUp.standUpEndTime} Unix Time Stamp!`);

  // callback function is not executed until setTimeout finishes
  setTimeout(() => {
    // concatenate all messages into 1 and push to channel's message
    let combinedMessage = null;
    if (channel.standUp.standUpMessages.length !== 0) {
      combinedMessage = channel.standUp.standUpMessages.join('\n');
    }
    channel.messages.push({
      messageId: channel.standUp.standUpMessageId,
      uId: tokenToAuth(token),
      message: combinedMessage,
      timeSent: getTimeStamp(),
      reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }],
      isPinned: false,
    });

    // initialize channel standup details
    channel.standUp.standUpStatus = false;
    channel.standUp.standUpEndTime = -1;
    channel.standUp.standUpMessageId = -1;
    channel.standUp.standUpSenderId = -1;
    channel.standUp.standUpMessages = [];
    setData(data);
    data.messagesExist.push({ numMessagesExist: data.messagesExist[data.messagesExist.length - 1].numMessagesExist + channel.standUp.standUpMessages.length, timeStamp: Math.floor((new Date()).getTime() / 1000) });

    console.log('standUp session has been closed');
  }, length * 1000);

  return {
    timeFinish: channel.standUp.standUpEndTime,
  };
}

/* This function tells if there is an active standup in a channel or not

  Arguments:
    token         (string) - tokenId of the user who starts the standup session
    channelId     (number) - id of the channel in which the standup session starts

  Return Value:
    Returns { HTTPError 400 } ON invalid channelId
    Returns { HTTP Error 403 } ON valid channelId but user who starts the standup session is not part of the channel
    Returns {
      isActive: channel.standupStatus,
      timeFinish: timeFinish,
    } ON no errors, where timeFinish is null if there is no active standup
*/

export function standUpActive(token: string, channelId: number): typeActive {
  const data = getData();
  const channel = data.channels.find((channel: typeChannel) => channel.channelId === channelId);

  // 400 Error
  if (channel === undefined) throw HTTPError(400, 'ChannelId does not refer to a valid channel');

  // 403 Errors
  if (!(channel.membersId.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser is not a member of the channel');
  }

  const currentTime = getTimeStamp();

  if (currentTime > channel.standUp.standUpEndTime) {
    return {
      isActive: false,
      timeFinish: null,
    };
  } else {
    return {
      isActive: true,
      timeFinish: channel.standUp.standUpEndTime,
    };
  }
}

/* This function is to send messages from standUp session to the channel

  Arguments:
    token         (string) - tokenId of the user who starts the standup session
    channelId     (number) - id of the channel in which the standup session starts
    message       (typeMessage) - the messages that are sent by the user who starts the session

  Return Value:
    Returns { HTTPError 400 } ON invalid channelId, if channel is currently inactive, if message length is 0 or exceeds 1000
    Returns { HTTP Error 403 } ON valid channelId but user who starts the standup session is not part of the channel
    Returns {} ON no errors
*/

export function standUpSend(token: string, channelId: number, message: string) {
  const data = getData();
  const channel = data.channels.find(element => element.channelId === channelId);

  // 400 Errors:
  if (channel === undefined) throw HTTPError(400, 'Invalid channelId');
  if (channel.standUp.standUpStatus === false) throw HTTPError(400, 'StandUp session is inactive!');
  if (message.length > 1000) throw HTTPError(400, 'Message length cannot exceed 1000!');
  if (message.length < 1) throw HTTPError(400, 'Message cannot be empty!');

  // 403 Error:
  if (!(channel.membersId.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser is not a member of the channel');
  }

  const firstName = Object.values(data.users).find(u => u.userId === tokenToAuth(token)).firstName;

  // push message to standUpSend
  const standUpMessages = firstName + ': ' + message;
  channel.standUp.standUpMessages.push(standUpMessages);

  const user = Object.values(data.users).find(u => u.userId === tokenToAuth(token));
  user.messagesSent.push({ numMessagesSent: user.messagesSent[user.messagesSent.length - 1].numMessagesSent + 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });
  notifyMessage(message, channelId, -1);
  return {};
}

// =========================================== helper functions   =========================================== //

// get current time (UTC Unix) in seconds
function getTimeStamp() {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime;
}

export { getTimeStamp };
