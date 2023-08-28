import { tokenToAuth, isTokenValid } from './auth';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

const TOKEN_ERROR = HTTPError(403, 'Invalid Token');

/* Creates a new channel with the given name that is either a public or private
  channel. The user who created it automatically joins the channel.
  {
    name:       (string)  name of channel,
    authUserId: (int)     userId of user who created channel,
    membersId:  ([int])   userIds array of users in channel,
    channelId:  (int)     unique id,
    isPublic:   (boolean) false = private, true = public
    messages:   ([message object]) array of messages sent in the channel
  }

  Arguments:
    token       (string)  - token of user calling function
    name        (string)  - name of channel
    isPublic    (boolean) - false = private, true = public

  Return Value:
    Returns { error: 'error' } ON invalid token, name length < 1 or > 20
    Returns { channelId: channelId (int) } ON no errors
*/

function channelsCreateV2(token: string, name: string, isPublic: boolean) {
  const data = getData();

  if (!isTokenValid(token)) {
    throw TOKEN_ERROR;
  }

  if (name.length < 1) {
    throw HTTPError(400, 'Length of Channel Name < 1');
  }

  if (name.length > 20) {
    throw HTTPError(400, 'Length of Channel Name > 20');
  }

  // initialise channelId
  const channelId = data.channels.length + 1;
  const authUserId = tokenToAuth(token);
  // push to data store channels array
  data.channels.push({
    name: name,
    owners: [authUserId],
    membersId: [authUserId],
    channelId: channelId,
    isPublic: isPublic,
    messages: [],
    standUp: {
      standUpStatus: false,
      standUpMessages: [],
      standUpMessageId: 0,
      standUpSenderId: 0,
      standUpEndTime: 0,
    }
  });

  const user = Object.values(data.users).find(u => u.userId === tokenToAuth(token));
  user.channelsJoined.push({ numChannelsJoined: user.channelsJoined[user.channelsJoined.length - 1].numChannelsJoined + 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });
  data.channelsExist.push({ numChannelsExist: data.channelsExist[data.channelsExist.length - 1].numChannelsExist + 1, timeStamp: Math.floor((new Date()).getTime() / 1000) });
  setData(data);
  return {
    channelId: channelId
  };
}

/* Lists all channels asosciated with the specified authUserId as the parameter

  channel: [
    {
      channelId: data.channels[i].channelId,
      name: data.channels[i].name,
    }
  ]

  Arguments:
    authUserId  (int)     - userId of user executing this function

  Return Value:
    Returns { error: 'error' } ON empty inputs (no users found) OR invalid users
    Returns { channels } ON no errors
*/

function channelsListV1(authUserId: number) {
  const data = getData();
  const userChannels = [];

  for (let i = 0; i < data.channels.length; i++) {
    const index = data.channels[i].membersId.indexOf(authUserId);
    if (index !== -1) {
      const channelTemp = {
        channelId: data.channels[i].channelId,
        name: data.channels[i].name,
      };
      userChannels.push(channelTemp);
    }
  }

  return {
    channels: userChannels,
  };
}

// channelsListV2: wrapper function for channelsListV1
function channelsListV2(token: string) {
  // checking if token is valid
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  const user = tokenToAuth(token);
  const listChannels = channelsListV1(user);

  return listChannels;
}

/* Lists all channels that exist in the data store regardless of authUserId
     The authUserId parameter is used to check if the authUserId is valid

  channel: [
    {
      channelId: data.channels[i].channelId,
      name: data.channels[i].name,
    }
  ]

  Arguments:
    authUserId  (int)     - userId of user executing this function

  Return Value:
    Returns { error: 'error' } ON empty inputs (no users found) OR invalid users
    Returns { channels } ON no errors
*/

function channelsListallV1(authUserId: number) {
  const data = getData();
  const allChannels = [];

  for (const channel of data.channels) {
    const object = {
      channelId: channel.channelId,
      name: channel.name,
    };
    allChannels.push(object);
  }

  return {
    channels: allChannels,
  };
}

// channelslistallV2: wrapper function for channelsListallV1
function channelsListallV2(token: string) {
  // checking if token is valid
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const user = tokenToAuth(token);
  const listChannels = channelsListallV1(user);

  return listChannels;
}

export { channelsCreateV2, channelsListV2, channelsListallV2 };
