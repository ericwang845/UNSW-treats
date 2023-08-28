import validator from 'validator';
import randomstring from 'randomstring';
import HTTPError from 'http-errors';
import crypto from 'crypto';
import config from './config.json';

import {
  getData,
  setData,
} from './dataStore';

export interface error {
  error: string,
  authUserId?: number,
  token?: string,
}

export interface authUserId {
  authUserId: number,
}

export interface tokenId {
  token: string,
  authUserId: number,
}

const SECRET = 'super top secret';

// This type represents an empty object
export type success = Record<string, never>;

// Checks for a valid email, password, first and last name
function checkRegisterDetails(email: string, password: string, nameFirst: string, nameLast: string) {
  if (password.length < 6) {
    throw HTTPError(400, 'Password must be at least 6 characters long');
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'First Name Must be between 1 and 50 characters long');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Last Name Must be between 1 and 50 characters long');
  }
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid Email');
  }
}

// Checks if a given handle is available to be used
function checkHandle(handle: string): boolean {
  const data = getData();

  for (const key in data.users) {
    if (data.users[key].userHandle === handle) {
      return false;
    }
  }

  return true;
}

// Generates an unused handle for a given first name and last name
function generateHandle(firstName: string, lastName: string): string {
  let handle = '' + firstName + lastName;
  handle = handle.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (handle.length > 20) {
    // trim to 20 characters
    handle = handle.substring(0, 20);
  }
  if (!checkHandle(handle)) {
    // handle is being used
    let i = 0;
    while (!checkHandle(handle + i)) {
      i++;
    }
    handle = handle + i;
  }
  return handle;
}

/**
 * Registers a user and creates an account associated with the given first name,
 * last name, email and password. An account will not be created if the given details
 * are invalid (eg. length restrictions, valid/taken email addresses)
 *
 * Arguments:
 *     email (String)       - Email address to be associated with account
 *     password (String)    - Password to be used to log into the account
 *     nameFirst (String)   - First name to be associated with account
 *     nameLast (String)    - Last name to be associated with account
 *
 *
 * Return Value:
 *     Returns { authUserId : (Number) } on success
 *     Throws error on failure
 */
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): authUserId | error {
  // Check entered details
  checkRegisterDetails(email, password, nameFirst, nameLast);
  const data = getData();

  if (email in data.users) {
    // email already in use
    throw HTTPError(400, 'Email already in use');
  }

  // Generate new authUserId (newId = number of current users + 1)
  // Implementation could change in the future if users are able to be unregistered
  const newId = Object.keys(data.users).length + data.removedUsers.length + 1;

  // set permission
  let permission = 2;
  if (Object.keys(data.users).length === 0) {
    permission = 1;
    data.globalOwner.push(newId);
  }

  // Generate an unused handle
  const handle = generateHandle(nameFirst, nameLast);

  // add to data
  data.users[email] = {
    userId: newId,
    firstName: nameFirst,
    lastName: nameLast,
    password: getHashOf(password),
    userHandle: handle,
    permission: permission,
    channelsJoined: [{ numChannelsJoined: 0, timeStamp: Math.floor((new Date()).getTime() / 1000) }],
    dmsJoined: [{ numDmsJoined: 0, timeStamp: Math.floor((new Date()).getTime() / 1000) }],
    messagesSent: [{ numMessagesSent: 0, timeStamp: Math.floor((new Date()).getTime() / 1000) }],
    notifications: [],
    profileImgUrl: `${config.url}:${config.port}/imgurl/1.jpg`,
  };

  setData(data);

  return {
    authUserId: newId,
  };
}

/**
 * Allows a user to log in to an account given they provide the account's email
 * and associated password. Provides the user with the account's unique authUserId upon
 * logging in. A successful login will occur if the provided email and password match
 * with an already registered account. A failure will result if there is no
 * registered account associated with the email, or if the password is incorrect.
 *
 * Arguments:
 *     email (String)       - Email address of an account
 *     password (String)    - Password associated with the email's account
 *
 * Return Value:
 *     Returns { authUserId : (Number) } on success
 *     Returns { error: 'error' } on failure
 */
function authLoginV1(email: string, password: string): authUserId | error {
  const data = getData();
  if (!(email in data.users)) {
    // no account associated with email
    throw HTTPError(400, 'No account associated with email');
  }

  if (!(data.users[email].password === getHashOf(password))) {
    // passwords dont match
    throw HTTPError(400, 'Password is incorrect');
  }

  return {
    authUserId: data.users[email].userId,
  };
}

/**
 * Function which generates a new unused session token, inserts into dataStore and returns token.
 */
function generateToken(authUserId: number) {
  const data = getData();
  let token = randomstring.generate(7);
  while (token in data.sessions) {
    // generate randomstrings until unused one
    token = randomstring.generate(7);
  }
  data.sessions[token] = authUserId;
  setData(data);
  return token;
}

/**
 * Wrapper function around authRegisterV1, which generates a session token for the registered new user
 */
function authRegisterV2(email: string, password: string, nameFirst: string, nameLast: string): error | tokenId {
  const newUser = authRegisterV1(email, password, nameFirst, nameLast);
  return {
    token: getHashOf(generateToken(newUser.authUserId)),
    authUserId: newUser.authUserId,
  };
}
/**
 * Wrapper function around authLoginV1, which generates a session token for the newly logged in user
 */
function authLoginV2(email: string, password: string): error | tokenId {
  const login = authLoginV1(email, password);

  return {
    token: getHashOf(generateToken(login.authUserId)),
    authUserId: login.authUserId,
  };
}

function authLogoutV1(inputToken: string): error | success {
  if (!isTokenValid(inputToken)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const data = getData();
  for (const token in data.sessions) {
    if (getHashOf(token) === inputToken) {
      delete data.sessions[token];
    }
  }
  setData(data);
  return {};
}

/**
 * Helper function to check if a token is valid
 */
function isTokenValid(token: string): boolean {
  const data = getData();
  // return (token in data.sessions);
  const allTokens = Object.keys(data.sessions);
  const hashedTokens = allTokens.map(x => getHashOf(x));
  return hashedTokens.includes(token);
}

/**
 * Helper function to return the userId associated with Hashed token assuming it is valid
 */
function tokenToAuth(inputToken: string): number {
  const data = getData();
  for (const token in data.sessions) {
    if (getHashOf(token) === inputToken) {
      return data.sessions[token];
    }
  }
}

function getHashOf(text: string) {
  return crypto.createHash('sha256').update(text + SECRET).digest('hex');
}

export { authLoginV1, authLoginV2, authLogoutV1, authRegisterV1, authRegisterV2, isTokenValid, tokenToAuth, getHashOf };
