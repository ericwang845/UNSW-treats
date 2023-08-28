import { getData, setData } from './dataStore';
import { tokenToAuth, isTokenValid } from './auth';
import HTTPError from 'http-errors';

// Checks whether the uId is valid and exists in the data
// Returns email on success, the string 'false' otherwise
function checkuId(uId: number): string {
  const data = getData();
  for (const key in data.users) {
    // console.log(data.users[key].userId);
    if (data.users[key].userId === uId) {
      return key;
    }
  }
  return 'false';
}

/**
* Given a user by their user ID, set their permissions to new permissions described by permissionId.
*
* Arguments:
*     uId        (Number)           - userId of the user whose permissions are to be changed
*     permissionId        (Number)         - new permissionId for the user whose permissions are to be changed
*
* Return Value:
*     Returns {
*     } on success
*
*     Returns 400 Error on
*           * uId does not refer to a valid user
*           * uId refers to a user who is the only global owner and they are being demoted to a user
*           * permissionId is invalid
*           * the user already has the permissions level of permissionId
*
*     Returns 403 Error on
*           * the authorised user is not a global owner
*
*/
function adminUserpermissionChangeV1(uId: number, permissionId: number, token: string) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Check the uId is valid
  if (checkuId(uId) === 'false') {
    throw HTTPError(400, 'Invalid uId');
  }

  const userEmail = checkuId(uId);

  // Check if uId refers to a user who is the only global owner and they are being demoted to a user
  // Also check if the user already has the permissions level of permissionId
  if (data.users[userEmail].permission === 1 && permissionId === 2) {
    throw HTTPError(400, 'uId refers to the only global owner who is being demoted');
  } else if (data.users[userEmail].permission === permissionId) {
    throw HTTPError(400, 'User with ID uId already has the new permission');
  }

  // Check if permissionId is valid
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'Invalid permission Id');
  }

  // Check if the authorised user is a global owner
  const authUserId = tokenToAuth(token);
  let isGlobalOwner = false;
  for (const user in data.users) {
    if (data.users[user].userId === authUserId) {
      if (data.users[user].permission === 1) {
        isGlobalOwner = true;
        // Make the changes to the permission of user with Id uId
        for (const user in data.users) {
          if (data.users[user].userId === uId) {
            data.users[user].permission = 1;
          }
        }
      }
    }
  }

  if (!isGlobalOwner) {
    throw HTTPError(403, 'The auth user is not a global owner');
  }

  setData(data);
  return {};
}

/**
* Given a user by their uId, remove them from the Treats. This means they should be removed from all
* channels/DMs, and will not be included in the array of users returned by users/all. Treats owners can
* remove other Treats owners (including the original first owner). Once users are removed, the contents of
* the messages they sent will be replaced by 'Removed user'. Their profile must still be retrievable with
* user/profile, however nameFirst should be 'Removed' and nameLast should be 'user'. The user's email and
* handle should be reusable.
*
* Arguments:
*     uId        (Number)           - userId of the user who is to be removed
*
* Return Value:
*     Returns {
*     } on success
*
*     Returns 400 Error on
*           * uId does not refer to a valid user
*           * uId refers to a user who is the only global owner
*
*     Returns 403 Error on
*           * the authorised user is not a global owner
*
*/
function adminUserRemoveV1(uId: number, token: string) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  // Check the uId is valid
  if (checkuId(uId) === 'false') {
    throw HTTPError(400, 'Invalid uId');
  }

  const userEmail = checkuId(uId);

  // Check if uId refers to a user who is the only global owner
  let globalOwnerCount = 0;
  if ((data.users[userEmail].permission === 1)) {
    for (const user in data.users) {
      if (data.users[user].permission === 1) {
        globalOwnerCount++;
      }
    }
    if (globalOwnerCount === 1) {
      throw HTTPError(400, 'uId refers to user who is the only global owner');
    }
  }

  // Check if the authorised user is a global owner
  const authUserId = tokenToAuth(token);
  let isGlobalOwner = false;
  for (const user in data.users) {
    if (data.users[user].userId === authUserId) {
      if (data.users[user].permission === 1) {
        isGlobalOwner = true;
      }
    }
  }

  if (!isGlobalOwner) {
    throw HTTPError(403, 'The auth user is not a global owner');
  }

  // Messages they sent will be replaced by 'Removed user' for DMs and Channels

  // Run through all DMs which contain the member to be removed, then for all of its messages,
  // if the message was sent by that user, replace it
  for (const DM of data.DMS) {
    if (DM.members.includes(uId)) {
      for (const message of DM.messages) {
        if (message.uId === uId) {
          message.message = 'Removed user';
        }
      }
      // Remove the user from the DM
      DM.members.splice(DM.members.indexOf(uId), 1);
    }
  }

  // Run through all Channels which contain the member to be removed, then for all of its messages,
  // if the message was sent by that user, replace it
  for (const channel of data.channels) {
    if (channel.membersId.includes(uId)) {
      for (const message of channel.messages) {
        if (message.uId === uId) {
          message.message = 'Removed user';
        }
      }
      // Remove the user from the channel
      channel.membersId.splice(channel.membersId.indexOf(uId), 1);
    }
  }

  // Their profile must still be retrievable with user/profile
  // however nameFirst should be 'Removed' and nameLast should be 'user'.
  data.removedUsers.push({
    email: userEmail,
    userId: data.users[userEmail].userId,
    userHandle: data.users[userEmail].userHandle,
  });

  delete data.users[userEmail];

  for (const token in data.sessions) {
    if (data.sessions[token] === uId) {
      // logout this sessions
      delete data.sessions[token];
    }
  }

  setData(data);
  return {};
}

export { adminUserpermissionChangeV1, adminUserRemoveV1 };
