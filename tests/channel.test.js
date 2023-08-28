// Tests for channel

import {channelInviteV1, channelJoinV1, channelDetailsV1, channelMessagesV1} from '../src/channel'
import {clearV1} from '../src/other'
import {channelsCreateV1} from '../src/channels'
import {authRegisterV1} from '../src/auth'
import { getData } from '../src/dataStore';
import {userProfileV1} from '../src/users'
  
const ERROR = {error: 'error'};

beforeEach(() => {
    clearV1();
});

describe('Test for channelMessagesV1', () => {
    test('channel does not exist', () => {
        let uid1 = authRegisterV1('john.smith@gmail.com', 'john smith', 'john', 'smith').authUserId;
        let cid1 = channelsCreateV1(uid1, 'First Channel', true).channelId;
        expect(channelMessagesV1(uid1, cid1 + 1, 1)).toEqual({error: 'error'});
    });
    test('channel exist but user is not in that channel', () => {
        let uid1 = authRegisterV1('john.smith@gmail.com', 'john smith', 'john', 'smith').authUserId;
        let uid2 = authRegisterV1('absolute.mate@gmail.com', 'absolute mate', 'Dnoces', 'Resu').authUserId;
        let cid1 = channelsCreateV1(uid1, 'First Channel', true).channelId;
        expect(channelMessagesV1(uid2, cid1, 1)).toEqual({error: 'error'});
    });
    test('everything is fine', () => {
        let uid1 = authRegisterV1('john.smith@gmail.com', 'john smith', 'john', 'smith');
        let cid1 = channelsCreateV1(uid1.authUserId, 'First Channel', true);
        expect(channelMessagesV1(uid1.authUserId, cid1.channelId, 0)).toStrictEqual(
            expect.objectContaining({
                messages: expect.any(Array),
                start: expect.any(Number),
                end: expect.any(Number),
            })
        );
    });
    test('start index exceeds maximum messages count in that channel', () => {
        let uid1 = authRegisterV1('123456@gmail.com', '12345', 'Tsrif', 'Resu').authUserId;
        let cid1 = channelsCreateV1(uid1, 'First Channel', true).channelId;
        expect(channelMessagesV1(uid1, cid1, 10)).toEqual({error: 'error'});
    });
});


describe('Testing channelInviteV1', () => {
    test('channelInviteV1: Correct Return Type — inviting to 1/1 public channels', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const invite = channelInviteV1(newUser.authUserId, newChannel.channelId, userBeingInvited.authUserId);
        expect(invite).toStrictEqual(
            expect.objectContaining({
            })
        ); 
    });

    test('channelInviteV1: Correct Return Type — inviting to 1/1 private channels', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel = channelsCreateV1(newUser.authUserId, 'Channel 1', false);
        const invite = channelInviteV1(newUser.authUserId, newChannel.channelId, userBeingInvited.authUserId);
        expect(invite).toStrictEqual(
            expect.objectContaining({
            })
        ); 
    });

    test('channelInviteV1: Correct Return Type — inviting to 1/3 channels', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel1 = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const newChannel2 = channelsCreateV1(newUser.authUserId, 'Channel 2', true);
        const newChannel3 = channelsCreateV1(newUser.authUserId, 'Channel 3', true);
        const invite = channelInviteV1(newUser.authUserId, newChannel2.channelId, userBeingInvited.authUserId);
        expect(invite).toStrictEqual(
            expect.objectContaining({
            })
        ); 
    });

    test('channelInviteV1: Correct Return Type — inviting to 2/3 channels', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel1 = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const newChannel2 = channelsCreateV1(newUser.authUserId, 'Channel 2', true);
        const newChannel3 = channelsCreateV1(newUser.authUserId, 'Channel 3', true);
        const invite1 = channelInviteV1(newUser.authUserId, newChannel1.channelId, userBeingInvited.authUserId);
        const invite2 = channelInviteV1(newUser.authUserId, newChannel3.channelId, userBeingInvited.authUserId);
        expect(invite1).toStrictEqual(
            expect.objectContaining({
            })
        );
        expect(invite2).toStrictEqual(
            expect.objectContaining({
            })
        );
    });

    test('channelInviteV1: channelId does not refer to a valid channel, 1 channel', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const invite = channelInviteV1(newUser.authUserId, 99, userBeingInvited.authUserId);
        expect(invite).toEqual(ERROR);
    });

    test('channelInviteV1: channelId does not refer to a valid channel, 3 channels', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel1 = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const newChannel2 = channelsCreateV1(newUser.authUserId, 'Channel 2', true);
        const newChannel3 = channelsCreateV1(newUser.authUserId, 'Channel 3', true);        
        const invite = channelInviteV1(newUser.authUserId, 99, userBeingInvited.authUserId);
        expect(invite).toEqual(ERROR);
    });

    test('channelInviteV1: authUserId does not refer to a valid user', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const invite = channelInviteV1(99, newChannel.channelId, userBeingInvited.authUserId);
        expect(invite).toEqual(ERROR);
    });

    test('channelInviteV1: userId does not refer to a valid user', () => {
        const newUser = authRegisterV1('example1@email.com', 'password123', 'firstName1', 'lastName1').authUserId;
        const userBeingInvited = authRegisterV1('example@email.com', 'password456', 'invited', 'person');
        const newChannel = channelsCreateV1(newUser, 'Channel 1', true);
        const invite = channelInviteV1(newUser, newChannel.channelId, 99);
        expect(invite).toEqual(ERROR);
    });

    test('channelInviteV1: userBeingInvited is already a member of the channel', () => {
        const newUser1 = authRegisterV1('example1@email.com', 'password123', 'firstName1', 'lastName1');
        const newUser2 = authRegisterV1('example2@email.com', 'password123', 'firstName2', 'lastName2');
        const userBeingInvited = authRegisterV1('example@email.com', 'password456', 'invited', 'person');
        const newChannel = channelsCreateV1(newUser1.authUserId, 'Channel 1', true);
        const invite = channelInviteV1(newUser1.authUserId, newChannel.channelId, userBeingInvited.authUserId);
        const inviteAgain = channelInviteV1(newUser1.authUserId, newChannel.channelId, userBeingInvited.authUserId);
        expect(invite).toStrictEqual(
            expect.objectContaining({
            })
        );
        expect(inviteAgain).toEqual(ERROR);
    });

    test('channelInviteV1: Valid channelId and authorised user is not a member of the channel', () => {
        const newUser1 = authRegisterV1('example1@email.com', 'password123', 'firstName1', 'lastName1');
        const newUser2 = authRegisterV1('example2@email.com', 'password123', 'firstName2', 'lastName2');
        const userBeingInvited = authRegisterV1('example@email.com', 'password456', 'invited', 'person');
        const newChannel = channelsCreateV1(newUser1.authUserId, 'Channel 1', true);
        const invite = channelInviteV1(newUser2.authUserId, newChannel.channelId, userBeingInvited.authUserId);
        expect(invite).toEqual(ERROR);
    });

});

describe('Testing channelJoinV1', () => {

    test('channelJoinV1: channelId does not refer to a valid channel, 0 channels', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const invite = channelInviteV1(newUser.authUserId, 99, userBeingInvited.authUserId);
        expect(invite).toEqual(ERROR);
    });

    test('channelJoinV1: channelId does not refer to a valid channel, 1 channel', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const invite = channelInviteV1(newUser.authUserId, 99, userBeingInvited.authUserId);
        expect(invite).toEqual(ERROR);
    });

    test('channelJoinV1: channelId does not refer to a valid channel, 3 channels', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const userBeingInvited = authRegisterV1('example2@email.com', 'password456', 'invited', 'person');
        const newChannel1 = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const newChannel2 = channelsCreateV1(newUser.authUserId, 'Channel 2', true);
        const newChannel3 = channelsCreateV1(newUser.authUserId, 'Channel 3', true);        
        const invite = channelInviteV1(newUser.authUserId, 99, userBeingInvited.authUserId);
        expect(invite).toEqual(ERROR);
    });

    test('channelJoinV1: channelId does not refer to a valid channel, 1 channel', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const newChannel = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const join = channelJoinV1(newUser.authUserId, 99);
        expect(join).toEqual(ERROR);
    });

    test('channelJoinV1: channelId does not refer to a valid channel, 3 channels', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const newChannel1 = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const newChannel2 = channelsCreateV1(newUser.authUserId, 'Channel 2', true);
        const newChannel3 = channelsCreateV1(newUser.authUserId, 'Channel 3', true);          
        const join = channelJoinV1(newUser.authUserId, 99);
        expect(join).toEqual(ERROR);
    });

    // Assumption — need to check that authUserId is a valid userId
    test('channelJoinV1: authUserId does not refer to a valid ID', () => {
        const newUser = authRegisterV1('example@email.com', 'password123', 'firstName', 'lastName');
        const newChannel = channelsCreateV1(newUser.authUserId, 'Channel 1', true);      
        const join = channelJoinV1(99, newChannel.channelId);
        expect(join).toEqual(ERROR);
    });

    test('channelJoinV1: user is already a member of the channel', () => {
        const newUser = authRegisterV1('example1@email.com', 'password123', 'firstName1', 'lastName1');
        const newChannel = channelsCreateV1(newUser.authUserId, 'Channel 1', true);
        const join = channelJoinV1(newUser.authUserId, newChannel.channelId);
        expect(join).toStrictEqual(ERROR);
    });

    test('channelJoinV1: channelId is a private channel, and the authorised user is not a channel member and not a global owner', () => {
        const newUser1 = authRegisterV1('example1@email.com', 'password123', 'firstName1', 'lastName1');
        const newUser2 = authRegisterV1('example2@email.com', 'password123', 'firstName2', 'lastName2');
        const newChannel = channelsCreateV1(newUser1.authUserId, 'Channel 1', false);
        const join = channelJoinV1(newUser2.authUserId, newChannel.channelId);
        expect(join).toEqual(ERROR);
    });

    test('channelJoinV1: channelId is a private channel, and the authorised user is not a channel member but is a global owner', () => {
        const newUser1 = authRegisterV1('example1@email.com', 'password123', 'firstName1', 'lastName1');
        const newUser2 = authRegisterV1('example2@email.com', 'password123', 'firstName2', 'lastName2');
        const newChannel = channelsCreateV1(newUser2.authUserId, 'Channel 1', false);
        const join = channelJoinV1(newUser1.authUserId, newChannel.channelId);
        expect(join).toStrictEqual(
            expect.objectContaining({
            })
        );
    });
});


