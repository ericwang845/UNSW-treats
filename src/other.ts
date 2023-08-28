import { getData, setData } from './dataStore';

/*
  Resets the internal data of the application to its initial state

  Arguments:

  Return Value:
*/
function clearV1() {
  const data = getData();
  data.users = {};
  data.removedUsers.splice(0);
  data.channels.splice(0);
  data.globalOwner.splice(0);
  data.sessions = {};
  data.resetCodes = {};
  data.DMS.splice(0);
  data.messageIds.splice(0);
  data.channelsExist.splice(1);
  data.dmsExist.splice(1);
  data.messagesExist.splice(1);
  setData(data);
  return {};
}

export { clearV1 };
