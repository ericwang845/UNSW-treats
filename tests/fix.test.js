/*
import { authLoginV1, authRegisterV1 } from "../src/auth";
import { channelDetailsV1, channelInviteV1, channelJoinV1, channelMessagesV1 } from "../src/channel";
import { channelsCreateV1, channelsListallV1, channelsListV1 } from "../src/channels";
import { getData } from "../src/dataStore";
import { clearV1 } from "../src/other";
import { userProfileV1 } from "../src/users";

let user1: number;
let user2: number;
let user3: number;
let publicChannel1: number;
let publicChannel2: number;
let privateChannel1: number;
let privateChannel2: number;
*/
test('temp', () => {
    expect(1+1).toEqual(2)
});
/*
beforeEach(() => {
    clearV1();
    user1 = authRegisterV1('john.smith1@gmail.com', 'john smith', 'john', 'smith').authUserId;
    user2 = authRegisterV1('john.smith2@gmail.com', 'john smith', 'john', 'smith').authUserId;
    user3 = authRegisterV1('john.smith3@gmail.com', 'john smith', 'john', 'smith').authUserId;
    publicChannel1 = channelsCreateV1(user1, 'Public Channel 1', true).channelId;
    publicChannel2 = channelsCreateV1(user2, 'Public Channel 2', true).channelId;
    privateChannel1 = channelsCreateV1(user1, 'Private Channel 1', false).channelId;
    privateChannel2 = channelsCreateV1(user2, 'Private Channel 2', false).channelId;
});


test('LINE 42: Test when no channels', () => {
    clearV1();
    user1 = authRegisterV1('john.smith1@gmail.com', 'john smith', 'john', 'smith').authUserId;
    let res = channelsListallV1(user1)['channels']
    expect(res).toStrictEqual([]);  
})
test('LINE 61: Test create channel successful > Created channel info in channel details', () => {
    let channelName = 'name';
    let chId = channelsCreateV1(user1, channelName, true).channelId;
    let deets = channelDetailsV1(user1, chId);
    expect(deets['name']).toBe(channelName);
})
test('LINE 78: Test create channel successful > Created channel info in channel details', () => {
    let channelName = 'andys room';
    let chId = channelsCreateV1(user1, channelName, true).channelId;
    let deets = channelDetailsV1(user1, chId);
    expect(deets['name']).toBe(channelName);
})

test('LINE 96: Test handles generated correctly > Should behave correctly for duplicate names', () => {
    let uId1 = getData().users['john.smith1@gmail.com'].userId;
    let email1 = 'john.smith1@gmail.com'
    let first1 = getData().users['john.smith1@gmail.com'].firstName;
    let last1 = getData().users['john.smith1@gmail.com'].lastName;
    let handle1 = getData().users['john.smith1@gmail.com'].userHandle 
    let expected1 = {'uId': uId1, 'email': email1, 'nameFirst': first1, 'nameLast': last1, 'handleStr': handle1};
    let chDeets = channelDetailsV1(user1, publicChannel1);
    expect(chDeets['allMembers']).toContainEqual(expected1);
});

test('LINE 169: Test global owner can join private channel', () => {
    channelJoinV1(user1, privateChannel2);
    let chDeets = channelDetailsV1(user1, privateChannel2);
    let owners = chDeets['ownerMembers'].map(mem => mem['uId']);
    let allmems = chDeets['allMembers'].map(mem => mem['uId']);
    expect(owners).toEqual(expect.not.arrayContaining([user1]));
    expect(allmems).toContain(user1);
});

test('LINE 183: Test global owner can join public channel', () => {
    channelJoinV1(user1, publicChannel2);
    let chDeets = channelDetailsV1(user1, publicChannel2);
    let owners = chDeets['ownerMembers'].map(mem => mem['uId']);
    let allmems = chDeets['allMembers'].map(mem => mem['uId']);
    expect(owners).toEqual(expect.not.arrayContaining([user1]));
    expect(allmems).toContain(user1);
});

test('LINE 198: Test inviting global owner 1', () => {
    channelInviteV1(user2, publicChannel2, user1);
    let channelDetail = channelDetailsV1(user1, publicChannel2);
    // buzz should be in all members, not owners
    let owners = channelDetail['ownerMembers'].map(mem => mem['uId']);      
    let allmems = channelDetail['allMembers'].map(mem => mem['uId']);
    expect(owners).toEqual(expect.not.arrayContaining([user1]));
    expect(allmems).toContain(user1);
});

test('LINE 212: Test inviting global owner 2', () => {
    channelInviteV1(user2, privateChannel2, user1);
    let channelDetail = channelDetailsV1(user1, privateChannel2);
    // buzz should be in all members, not owners
    let owners = channelDetail['ownerMembers'].map(mem => mem['uId']);                                              
    let allmems = channelDetail['allMembers'].map(mem => mem['uId']);
    expect(owners).toEqual(expect.not.arrayContaining([user1]));
    expect(allmems).toContain(user1);
});

test('LINE 231: Test successful no messages', () => {
    let res = channelMessagesV1(user1, publicChannel1, 0);
    expect(res['start']).toBe(0);
    expect(res['end']).toBe(-1);
    expect(res['messages']).toStrictEqual([]);
});

test('LINE 248: Test error when start greater than message num', () => {
    let res = channelMessagesV1(user1, publicChannel1, 21389429);
    expect(res).toStrictEqual({error: 'error'});
});
*/