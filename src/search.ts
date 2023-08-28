import HTTPError from 'http-errors';
import { isTokenValid } from './auth';

import {
  getData,
  setData,
} from './dataStore';

/**
 * Given a query string, return a collection of messages in all of the channels/DMs that the user has joined that contain the query
 * (case-insensitive). There is no expected order for these messages.
 *
 * Arguments:
 *     queryStr (String)       - Query string to be found in messages of channels/DMs
 *
 *
 * Return Value:
 *     Returns { messages } on success
 *     Returns Http Error 400 on failure (length of queryStr is less than 1 or over 1000 characters)
 */
function searchV1(queryStr: string, token: string) {
  const data = getData();
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  // Check if the length of queryStr is less than 1 or over 1000 characters
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'Password must be at least 6 characters long');
  }

  const lowerQueryString = queryStr.toLowerCase();

  const messages = [];

  for (const channel of data.channels) {
    for (const message of channel.messages) {
      const messageString = message.message.toLowerCase();
      if (messageString.includes(lowerQueryString)) {
        messages.push(message);
      }
    }
  }

  for (const DM of data.DMS) {
    for (const message of DM.messages) {
      const messageString = message.message.toLowerCase();
      if (messageString.includes(lowerQueryString)) {
        messages.push(message);
      }
    }
  }

  setData(data);

  return {
    messages: messages,
  };
}

export { searchV1 };
