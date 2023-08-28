import validator from 'validator';
import HTTPError from 'http-errors';
import config from './config.json';

const TOKEN_ERROR = HTTPError(403, 'Invalid Token');

import {
  getData, setData,
} from './dataStore';

import { isTokenValid, tokenToAuth, error, success } from './auth';

export interface user {
  user: {
    uId: number,
    email: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string,
  }
}

// Checks if a handle given to sethandle is valid
function checkNewHandle(handle: string): boolean {
  const data = getData();
  for (const key in data.users) {
    if (data.users[key].userHandle === handle) {
      return false;
    }
  }

  if (handle.length < 3 || handle.length > 20) {
    return false;
  }
  const handleCopy = handle.slice();
  // To check if handle is alphanumeric, compare it to itself when any non alphanumeric characters are removed
  if (!(handleCopy.toLowerCase().replace(/[^a-z0-9]/g, '') === handle.toLowerCase())) {
    return false;
  } else {
    return true;
  }
}

// Checks if a name given to setname is valid
function checkNewName(nameFirst: string, nameLast: string): boolean {
  if (nameFirst.length < 1 || nameFirst.length > 50 || nameLast.length < 1 || nameLast.length > 50) {
    return false;
  } else {
    return true;
  }
}

// Checks whether the uId is valid and exists in the data
// Returns email on success, the string 'false' otherwise
function checkuId(uId: number) {
  const data = getData();
  for (const key in data.users) {
    if (data.users[key].userId === uId) {
      return key;
    }
  }
  for (const removedUser of data.removedUsers) {
    if (removedUser.userId === uId) {
      return 'removed';
    }
  }
  return 'false';
}

/**
* Allows an authorised user with an Id (authUserId), to view details about another
* user given that they provide their Id (uId). The details of a user include their
* First Name, Last Name, and Email address that they used to register their account,
* as well their uId and handle that has been generated for them.
* The details will not be returned if either of the Ids provided do not
* reference a registered user.
*
* Arguments:
*     authUserId (Number)           - userId of the authorised user attempting to view a profile.
*     uId        (Number)           - userId of the user to be viewed.
*
* Return Value:
*     Returns {
*        user: {
*         uId: (Number),
*         email: (String),
*         nameFirst: (String),
*         nameLast: (String),
*         handleStr: (String),
*        }
*     } on success
*
*     Throws error on failure
*/
function userProfileV1(authUserId: number, uId: number) {
  const data = getData();
  // Check the uIds are valid
  if (checkuId(uId) === 'false' || checkuId(authUserId) === 'false') {
    // one of the uIds are invalid
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
  const user = checkuId(uId);
  if (user === 'removed') {
    // we are viewing a removed user
    for (const removedUser of data.removedUsers) {
      if (removedUser.userId === uId) {
        return {
          user: {
            uId: removedUser.userId,
            email: removedUser.email,
            nameFirst: 'Removed',
            nameLast: 'user',
            handleStr: removedUser.userHandle,
            profileImgUrl: `${config.url}:${config.port}/imgurl/1.jpg`,
          }
        };
      }
    }
  }
  return {
    user: {
      uId: uId,
      email: user,
      nameFirst: data.users[user].firstName,
      nameLast: data.users[user].lastName,
      handleStr: data.users[user].userHandle,
      profileImgUrl: data.users[user].profileImgUrl,
    }
  };
}
/*
*  Returns an array of all users and their associated details.
*
* Arguments:
*     token (String)           - token of the authorised user attempting to view all users
*
* Return Value:
*     Returns {
*        users: [{
*         uId: (Number),
*         email: (String),
*         nameFirst: (String),
*         nameLast: (String),
*         handleStr: (String),
*        }]
*     } on success
*
*     Returns { error: 'error' } on failure (ASSUMPTION: token must correspond to a valid session)
*/
function usersAllV2(token: string) {
  const data = getData();
  // Check the token is valid
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  const usersArray = [];
  for (const email in data.users) {
    const id = data.users[email].userId;
    usersArray.push(userProfileV1(id, id).user);
  }

  return { users: usersArray };
}

/**
 * Wrapper function around userProfileV1 to work with token
 */
function userProfileV2(token: string, uId: number): error | user {
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  return userProfileV1(tokenToAuth(token), uId);
}

/*
* Updates the authorised user's handle (i.e. display name)
*
* Arguments:
*     token (String)           - token of the authorised user attempting to update their handle
*     handleStr (String)       - new handle string
*
* Return Value:
*     Returns {
*     } on success
*
*     Returns { error: 'error' } on failure (ASSUMPTION: token must correspond to a valid session,
*     length of handleStr is not between 3 and 20 characters inclusive,
*     handleStr contains characters that are not alphanumeric,
*     the handle is already used by another user)
*/
function userProfileSethandleV2(token: string, handleStr: string) {
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (checkNewHandle(handleStr)) {
    const data = getData();

    // convert the given token to a userId
    const Id = tokenToAuth(token);

    // run through all of the emails in data.users until data.users[email].userId === Id
    Object.values(data.users).find(u => u.userId === Id).userHandle = handleStr;
    setData(data);
    return {};
  } else {
    throw HTTPError(400, 'Invalid new handle');
  }
}

/*
* Updates the authorised user's name
*
* Arguments:
*     token (String)           - token of the authorised user attempting to update their name
*     nameFirst (String)       - new first name
*     nameLast (String)       - new last name
*
* Return Value:
*     Returns {
*     } on success
*
*     Returns { error: 'error' } on failure (ASSUMPTION: token must correspond to a valid session,
*     length of nameFirst is not between 1 and 50 characters inclusive,
*     length of nameLast is not between 1 and 50 characters inclusive)
*/
function userProfileSetnameV2(token: string, nameFirst: string, nameLast: string) {
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (checkNewName(nameFirst, nameLast)) {
    const data = getData();

    // convert the given token to a userId
    const Id = tokenToAuth(token);

    // run through all of the emails in data.users until data.users[email].userId === Id
    Object.values(data.users).find(u => u.userId === Id).firstName = nameFirst;
    Object.values(data.users).find(u => u.userId === Id).lastName = nameLast;
    setData(data);
    return {};
  } else {
    throw HTTPError(400, 'Invalid name');
  }
}

/**
 * Fetch the required statistics about this user's use of UNSW Treats.
 *
 * Arguments:
 *  token:      string  - token of authUser

 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token
 *  Returns { userStats: {
 *    channelsJoined: [{numChannelsJoined, timeStamp}],
 *    dmsJoined:      [{numDmsJoined, timeStamp}],
 *    messagesSent:   [{numMessagesSent, timeStamp}],
 *    involvementRate,
 * }} On no Error
 */

function userStatsV1(token: string) {
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  const data = getData();

  const user = Object.values(data.users).find(u => u.userId === tokenToAuth(token));
  const numChannelsJoined = user.channelsJoined[user.channelsJoined.length - 1].numChannelsJoined;
  const numDmsJoined = user.dmsJoined[user.dmsJoined.length - 1].numDmsJoined;
  const numMsgsSent = user.messagesSent[user.messagesSent.length - 1].numMessagesSent;
  const numChannels = data.channels.length;
  const numDms = data.DMS.length;
  const numMsgs = data.messageIds.length;
  let involvementRate: number;

  // if the total number of channels, dms and messages in Treats is 0, set
  // involvement rate to 0
  if (numChannels + numDms + numMsgs === 0) {
    involvementRate = 0;
  } else {
    involvementRate = (numChannelsJoined + numDmsJoined + numMsgsSent) / (numChannels + numDms + numMsgs);
  }

  if (involvementRate > 1) {
    involvementRate = 1;
  }

  return {
    userStats: {
      channelsJoined: user.channelsJoined,
      dmsJoined: user.dmsJoined,
      messagesSent: user.messagesSent,
      involvementRate: involvementRate,
    }
  };
}

function usersStatsV1(token: string) {
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  const data = getData();
  let numUsersWhoHaveJoinedAtLeastOneChannelOrDm = 0;

  // traverse through users and check if they have joined a channel or DM
  Object.values(data.users).forEach(u => {
    // if so, incremement the count
    if (u.channelsJoined[u.channelsJoined.length - 1].numChannelsJoined > 0 && u.dmsJoined[u.dmsJoined.length - 1].numDmsJoined > 0) {
      numUsersWhoHaveJoinedAtLeastOneChannelOrDm++;
    }
  });
  const utilizationRate = numUsersWhoHaveJoinedAtLeastOneChannelOrDm / Object.keys(data.users).length;
  return {
    workspaceStats: {
      channelsExist: data.channelsExist,
      dmsExist: data.dmsExist,
      messagesExist: data.messagesExist,
      utilizationRate: utilizationRate,
    }
  };
}

/*
* Updates a user's email
*
* Arguments:
*     token (String)           - token of the authorised user attempting to update their email
*     email                    - new email to be set
*
* Return Value:
*     Returns {
*     } on success
*
*     Throws error on failure:
*       - token is invalid
*       - email is not a valid email
*       - new email is already in use
*/
function setEmail(token: string, email: string): error | success {
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid Email');
  }

  const data = getData();
  if (email in data.users) {
    throw HTTPError(400, 'Email already in use');
  }

  const oldEmail = checkuId(tokenToAuth(token));
  if (oldEmail === 'false') {
    throw HTTPError(400, 'Token references invalid uId');
  }

  data.users[email] = data.users[oldEmail];
  delete data.users[oldEmail];
  setData(data);
  return {};
}

export { userProfileV1, usersAllV2, userProfileV2, userProfileSethandleV2, userProfileSetnameV2, setEmail, userStatsV1, usersStatsV1, checkuId };
