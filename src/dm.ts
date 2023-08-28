import { getData, setData } from './dataStore';
import { tokenToAuth, isTokenValid } from './auth';
import { userProfileV1 } from './users';
import HTTPError from 'http-errors';
import { notifyMessage } from './message';

const TOKEN_ERROR = HTTPError(403, 'Invalid Token');
const DM_ERROR = HTTPError(400, 'Invalid DmId');

/*  Creates typeDM object and pushes to dataStore.DMS array.
  uIds contains the user(s) that this DM is directed to, and will not include
  the creator. The creator is the owner of the DM.
  name should be automatically generated based on the users that are in this DM.
  The name should be an alphabetically-sorted, comma-and-space-separated array
  of user handles, e.g. 'ahandle1, bhandle2, chandle3'.

  Arguments:
    token   (string)  - token of user calling function
    uIds    (number[])  - array of userIds

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid or duplicate uId in uIds.
    Returns { dmId: dmId (number) } ON no error.
*/

function DMCreateV1(token: string, uIds: Array<number>) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  let error = false;
  // check for duplicates, if duplicate return undefined
  uIds.filter((element, i) => {
    if (uIds.indexOf(element) !== i) {
      error = true;
      return undefined;
    }
    return element;
  });

  uIds.push(tokenToAuth(token));

  // initialise array of userHandles of uIds
  const names = uIds.map(id => {
    const handle = Object.values(data.users).find(user => user.userId === id);
    if (handle === undefined) {
      error = true;
      return undefined;
    }
    return handle.userHandle;
  });

  if (error) {
    throw HTTPError(400, 'Invalid or Duplicate Uids');
  }

  // initialise name of DM
  names.sort((a, b) => a.localeCompare(b));
  let name = '';
  for (let i = 0; i < names.length; i++) {
    if (i !== 0) {
      name += ', ';
    }
    name += String(names[i]);
  }

  // push Dm to datastore
  const dmId = data.DMS.length + 1;
  data.DMS.push({
    dmId: dmId,
    name: name,
    owner: tokenToAuth(token),
    members: uIds,
    messages: [],
  });

  // update stats for each user and workspace stats
  uIds.forEach(userId => {
    if (userId !== tokenToAuth(token)) {
      notifyDmJoin(tokenToAuth(token), dmId, userId);
    }
    const user = Object.values(data.users).find(u => u.userId === userId);
    user.dmsJoined.push({ numDmsJoined: user.dmsJoined[user.dmsJoined.length - 1].numDmsJoined + 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });
  });

  data.dmsExist.push({ numDmsExist: data.dmsExist[data.dmsExist.length - 1].numDmsExist + 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });

  setData(data);
  return {
    dmId: dmId,
  };
}

/*  Returns the array of DMs that the token user is a member of.

  Arguments:
    token   (string)  - token of user calling function

  Return Value:
    Returns { error: 'error' } ON invalid token
    Returns { dms: [{ dmId: number, name: string }] } ON no error.
*/
function DMListV1(token: string) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  // initialise array of objects of dmId and dm name, returns undefined to array
  // if dm authUser is not a member
  const list = data.DMS.map(chat => {
    if (chat.members.includes(tokenToAuth(token))) {
      return {
        dmId: chat.dmId,
        name: chat.name
      };
    }
    return undefined;
  }).filter(e => e !== undefined);
  return { dms: list };
}

/*  Remove an existing DM, so all members are no longer in the DM. This can only
   be done by the original creator of the DM.

  Arguments:
    token   (string)  - token of user calling function
    dmId    (number)  - id of DM

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid dmId, token user not
      creator of DM, token user no longer a member of DM
    Returns { } ON no error.
*/
function DMRemoveV1(token: string, dmId: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  if (!isDMIdValid(dmId)) {
    throw DM_ERROR;
  }

  const DM = data.DMS.find(DM => DM.dmId === dmId);
  if (!(DM.members.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser not a member of DM');
  }

  if (DM.owner !== tokenToAuth(token)) {
    throw HTTPError(403, 'AuthUser not DM Creator');
  }

  // Update dmsJoined stats for each user in the Dm
  DM.members.forEach(userId => {
    const user = Object.values(data.users).find(u => u.userId === userId);
    user.dmsJoined.push({ numDmsJoined: user.dmsJoined[user.dmsJoined.length - 1].numDmsJoined - 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });
  });

  // Remove all messageIds present in the dm in dataStore to account for removal
  // of dm messages
  DM.messages.forEach(m => data.messageIds.splice(data.messageIds.indexOf(m.messageId), 1));

  // update messagesExist workspace stats to account for removal of messages
  if (DM.messages.length > 0) {
    data.messagesExist.push({ numMessagesExist: data.messagesExist[data.messagesExist.length - 1].numMessagesExist - DM.messages.length, timeStamp: Math.floor((new Date()).getTime() / 1000) });
  }

  // remove dm from dataStore Dms array
  data.DMS.splice(data.DMS.indexOf(DM), 1);

  // update dmsExist workspace stats to account for removal of DM
  data.dmsExist.push({ numDmsExist: data.dmsExist[data.dmsExist.length - 1].numDmsExist - 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });
  setData(data);
  return {};
}

/*  Given a DM with ID dmId that the authorised user is a member of, provide
  basic details about the DM.

  Arguments:
    token   (string)  - token of user calling function
    dmId    (number)  - id of DM

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid dmId, token user no
      longer a member of DM
    Returns { name: string, members: [{ uId: number, email: string,
      nameFirst: string, nameLast: string, handleStr: string}]} ON no error.
*/
function DMDetailsV1(token: string, dmId: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  if (!isDMIdValid(dmId)) {
    throw DM_ERROR;
  }

  // initialise DM matching dmId
  const DM = data.DMS.find(dm => dm.dmId === dmId);
  if (!(DM.members.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser not a member of Dm');
  }

  // initialise array of user details of each member in array
  const members = DM.members.map(memberId => userProfileV1(tokenToAuth(token), memberId).user);

  return {
    name: DM.name,
    members: members,
  };
}

/*  Given a DM with ID dmId that the authorised user is a member of, return up
  to 50 messages between index "start" and "start + 50". Message with index 0 is
  the most recent message in the DM. This function returns a new index "end" which
  is the value of "start + 50", or, if this function has returned the least
  recent messages in the DM, returns -1 in "end" to indicate there are no more
  messages to load after this return.

  Arguments:
    token:  string  - token of user calling function
    dmId:   number  - id of DM
    start:  number  - start of message index

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid dmId, token user not a
      member of DM, start greater than total no of messages in channel.
    Returns { messages: [{ messageId: number, uId: number, message: string,
      timeSent: number }], start: number, end: number } ON no error.
*/
function DMMessagesV1(token: string, dmId: number, start: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  if (!isDMIdValid(dmId)) {
    throw DM_ERROR;
  }

  const DM = data.DMS.find(DM => (DM.members.includes(tokenToAuth(token))) && DM.dmId === dmId);
  if (DM === undefined) {
    throw HTTPError(403, 'AuthUser not a member of Dm');
  }

  // Edge Case: if no messages exist in DM
  if (DM.messages.length === 0) {
    if (start === 0) {
      return {
        messages: [],
        start: start,
        end: -1
      };
    }

    throw HTTPError(400, 'Start is greater than no of Dm Messages');
  }

  // if the starting index is greater than the no of messages in DM
  if (start >= DM.messages.length) {
    throw HTTPError(400, 'Start is greater than no of Dm Messages');
  }

  let end = start + 50;

  // initialise array of messages reversed
  const temp = [...DM.messages].reverse();
  // paginate up to 50 messages
  const messages = temp.slice(start, end);
  // initialise end index to -1 if the oldest message is paginated
  if (messages[messages.length - 1].messageId === DM.messages[0].messageId) {
    end = -1;
  }

  messages.forEach(m => m.reacts.forEach(r => { r.isThisUserReacted = r.uIds.includes(tokenToAuth(token)); }));
  return {
    messages: messages,
    start: start,
    end: end,
  };
}

/*  Given a DM ID, the user is removed as a member of this DM. The creator is
  allowed to leave and the DM will still exist if this happens. This does not
  update the name of the DM.

  Arguments:
    token:  string  - token of user calling function
    dmId:   number  - id of DM

  Return Value:
    Returns { error: 'error' } ON invalid token, invalid dmId, token user not a
      member of DM.
    Returns { } ON no error.
*/
function DMLeaveV1(token: string, dmId: number) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  if (!isDMIdValid(dmId)) {
    throw DM_ERROR;
  }

  const DM = data.DMS.find(DM => DM.dmId === dmId);
  if (!(DM.members.includes(tokenToAuth(token)))) {
    throw HTTPError(403, 'AuthUser not a member of Dm');
  }

  // remove userId from Dm members
  DM.members.splice(DM.members.indexOf(tokenToAuth(token)), 1);

  // if the authUser is an owner, no DM Owner is present after he leaves
  if (DM.owner === tokenToAuth(token)) {
    DM.owner = null;
  }

  // update AuthUser user stats of dmsJoined
  const user = Object.values(data.users).find(u => u.userId === tokenToAuth(token));
  user.dmsJoined.push({ numDmsJoined: user.dmsJoined[user.dmsJoined.length - 1].numDmsJoined - 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });

  setData(data);
  return {};
}

/*
  Send a message from authorisedUser to the DM specified by dmId. Note: Each message should have it's own
  unique ID, i.e. no messages should share an ID with another message, even if that other message is in a
  different channel or DM.

  Arguments:
    token    (str)   - token of the user who executed this function. Must match a token in dataStore
                            and be a member of the DM they are messaging
    dmId     (int)   - dmId of the DM the user is attempting to message. Must match
                            a dmId in dataStore
    message      (str)   - text message that the user wishes to send to the DM

  Return Value:
    Returns { error: 'error } ON dmId does not refer to a valid DM
                              ON length of message is less than 1 or over 1000 characters
                              ON dmId is valid and the authorised user is not a member of the DM

    Returns {}                ON no error
*/
function messageSendDmV2(token: string, dmId: number, message: string) {
  const data = getData();

  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  if (!isDMIdValid(dmId)) {
    throw DM_ERROR;
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  let newMessageId: number;
  if (data.messageIds.length === 0) {
    newMessageId = 1;
  } else {
    newMessageId = data.messageIds[data.messageIds.length - 1] + 1;
  }

  const authUserId = tokenToAuth(token);

  // Check if dmId is valid
  for (let i = 0; i < data.DMS.length; i++) {
    if (data.DMS[i].dmId === dmId) {
      // Check if authUser is in the DM they intend to message
      if (data.DMS[i].members.includes(authUserId) || data.DMS[i].owner === authUserId) {
        data.DMS[i].messages.push({
          messageId: newMessageId,
          uId: authUserId,
          message: message,
          timeSent: Math.floor((new Date()).getTime() / 1000),
          reacts: [{ reactId: 1, uIds: [], isThisUserReacted: false }],
          isPinned: false,
        });
        data.messageIds.push(newMessageId);

        notifyMessage(message, -1, dmId);
        setData(data);
        return {
          messageId: newMessageId
        };
      } else {
        throw HTTPError(403, 'Auth user is not a member of the DM with ID dmId');
      }
    }
  }
}

/*
  Checks if dmId exists in datastore
*/
function isDMIdValid(dmId: number) {
  const data = getData();
  if (data.DMS.some(dm => dm.dmId === dmId)) {
    return true;
  }
  return false;
}

/**
 * Notifies user of uId of authUser creating a Dm with uId as a member
 * @param authUserId
 * @param dmId
 * @param uId
 */
function notifyDmJoin(authUserId: number, dmId: number, uId: number) {
  const data = getData();
  const user = Object.values(data.users).find(u => u.userId === uId);
  const dm = data.DMS.find(d => d.dmId === dmId);
  const authUser = Object.values(data.users).find(u => u.userId === authUserId);
  user.notifications.push({ channelId: -1, dmId: dmId, notificationMessage: `${authUser.userHandle} added you to ${dm.name}` });
}

export { DMCreateV1, DMListV1, DMRemoveV1, DMDetailsV1, DMMessagesV1, DMLeaveV1, messageSendDmV2, isDMIdValid };
