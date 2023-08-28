import { isTokenValid, tokenToAuth } from './auth';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

const TOKEN_ERROR = HTTPError(403, 'Invalid Token');

/**
 * Return the user's most recent 20 notifications, ordered from most recent to least
 * recent.
 *
 * Arguments:
 *  token:      string  - token of authUser
 *
 * Return Value:
 *  Returns { statusCode: 403 } ON invalid Token
 *  Returns { notifications: [{ channelId, dmId, notificationMessage }] } On no Error
 */
function notificationsGetV1(token: string) {
  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }
  const data = getData();
  const user = Object.values(data.users).find(u => u.userId === tokenToAuth(token));
  const temp = [...user.notifications].reverse();
  const notifications = temp.slice(0, 20);
  setData(data);
  return { notifications: notifications };
}

export { notificationsGetV1 };
