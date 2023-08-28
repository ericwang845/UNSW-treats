import fs from 'fs';

// YOU SHOULD MODIFY THIS OBJECT BELOW

export interface typeNotification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
}

export interface typeUser {
  [email: string]: {
    userId: number;
    firstName: string;
    lastName: string;
    password: string;
    userHandle: string;
    permission: number;
    channelsJoined: Array<{numChannelsJoined: number, timeStamp: number}>;
    dmsJoined: Array<{numDmsJoined: number, timeStamp: number}>;
    messagesSent: Array<{numMessagesSent: number, timeStamp: number}>;
    notifications: typeNotification[] | null;
    profileImgUrl: string;
  };
}

export interface typeRemovedUser {
    email: string;
    userId: number;
    userHandle: string;
}

export interface typeSessions {
  [token: string]: number
}

export interface typeResetCodes {
  [code: string]: string
}

export interface typeMessage {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: [{reactId:1, uIds: Array<number>, isThisUserReacted: boolean}];
  isPinned: boolean;
}

export interface typeStandUp {
  standUpStatus: boolean;
  standUpMessages: Array<string> | null;
  standUpMessageId: number;
  standUpSenderId: number;
  standUpEndTime: number;
}

export interface typeChannel {
  name: string;
  owners: Array<number> | null;
  membersId: Array<number> | null;
  channelId: number;
  isPublic: boolean;
  messages: typeMessage[] | null;
  standUp: typeStandUp;
}

export interface typeDM {
  dmId: number;
  name: string;
  owner: number;
  members: Array<number> | null;
  messages: typeMessage[] | null;
}

export interface typeActive {
  isActive: boolean;
  timeFinish: number;
}

export interface typeData {
  users: typeUser;
  removedUsers: typeRemovedUser[],
  channels: typeChannel[] | null;
  globalOwner: Array<number> | null;
  sessions: typeSessions;
  resetCodes: typeResetCodes;
  DMS: typeDM[] | null;
  messageIds: Array<number> | null;
  channelsExist: Array<{numChannelsExist: number, timeStamp: number}>;
  dmsExist: Array<{numDmsExist: number, timeStamp: number}>;
  messagesExist: Array<{numMessagesExist: number, timeStamp: number}>
}

let dataStore: typeData = {
  users: {},
  removedUsers: [],
  channels: [],
  globalOwner: [],
  sessions: {},
  resetCodes: {},
  DMS: [],
  messageIds: [],
  channelsExist: [{ numChannelsExist: 0, timeStamp: Math.floor((new Date()).getTime() / 1000) }],
  dmsExist: [{ numDmsExist: 0, timeStamp: Math.floor((new Date()).getTime() / 1000) }],
  messagesExist: [{ numMessagesExist: 0, timeStamp: Math.floor((new Date()).getTime() / 1000) }],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the In-memory data (used by your functions)
function getData() {
  return dataStore;
}

// Use set(newData) to pass in the entire data object, with modifications made, modifies the in-memory data (used by your functions)
function setData(newData: typeData) {
  dataStore = newData;
}

/**
 * Writes the current in-memory dataStore to data.json, (only used by server in server.ts)
 */
function saveData() {
  const data = getData();
  fs.writeFileSync('src/data.json', JSON.stringify(data), { flag: 'w' });
}

/**
 * Loads the dataStore saved in data.json to be our in-memory data (only used by server in server.ts)
 */
function loadData() {
  const data = fs.readFileSync('src/data.json', { flag: 'r' });
  setData(JSON.parse(String(data)));
}

export { getData, setData, loadData, saveData };
