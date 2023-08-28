import {channelsCreateV1, channelsListV1, channelsListallV1} from '../src/channels'
import {clearV1} from '../src/other'
import {authRegisterV1} from '../src/auth'

beforeEach(() => {
    clearV1();
});

describe('TESTING channelsListV1', () => {
  test('Empty input', () => {
      expect(channelsListV1(99)).toEqual({error: 'error'});
  })

  test('Invalid input', () => {
    expect(channelsListV1(99)).toEqual({error: 'error'});
  })

  test('single user but no channel', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats38', 'Alex', 'Good');
    expect(channelsListV1(user1.authUserId)).toEqual(
      {
        channels: []
      }
    );
  });

  test('Many channels but user is not part of any channel', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats38', 'Alex', 'Good');
    const user2 = authRegisterV1('cindy@gmail.com', 'ILoveDogs38', 'Cindy', 'Good');

    const channelId1 = channelsCreateV1(user2.authUserId, 'Channel One', true);
    const channelId2 = channelsCreateV1(user2.authUserId, 'Channel One', true);
    const channelId3 = channelsCreateV1(user2.authUserId, 'Channel One', true);
    const channelId4 = channelsCreateV1(user2.authUserId, 'Channel One', true);

    expect(channelsListV1(user1.authUserId)).toEqual(
      {
        channels: []
      }
    );
  });

  test('Many channels but user is only part of one channel', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats38', 'Alex', 'Good');
    const user2 = authRegisterV1('cindy@gmail.com', 'ILoveDogs38', 'Cindy', 'Good');

    const channelId1 = channelsCreateV1(user2.authUserId, 'Channel 1', true);
    const channelId2 = channelsCreateV1(user2.authUserId, 'Channel 2', true);
    const channelId3 = channelsCreateV1(user2.authUserId, 'Channel 3', true);
    const channelId4 = channelsCreateV1(user2.authUserId, 'Channel 4', true);
    const channelId5 = channelsCreateV1(user1.authUserId, 'Channel Ultimate', false);

    expect(channelsListV1(user1.authUserId)).toEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel Ultimate',
          },
        ]
      }
    );
  });

  test('One user with multiple channels', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats', 'Alex', 'Smith');
    const user2 = authRegisterV1('cindy@gmail.com', 'ILoveDogs', 'Cindy', 'Smith');

    const channelId1 = channelsCreateV1(user1.authUserId, 'Channel 1', true);
    const channelId2 = channelsCreateV1(user2.authUserId, 'Channel 2', true);
    const channelId3 = channelsCreateV1(user1.authUserId, 'Channel 3', true);
    const channelId4 = channelsCreateV1(user2.authUserId, 'Channel 4', true);

    expect(channelsListV1(user1.authUserId)).toEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel 1',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel 3',
          },
        ]
      }
    )
  })
})

describe('TESTING channelsListallV1', () => {
  test('No input', () => {
    expect(channelsListallV1(99)).toEqual({error: 'error'});
  });

  test('invalid user', () => {
    expect(channelsListallV1(99)).toEqual({error: 'error'});
  });

  test('single user but no channel', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats38', 'Alex', 'Good');
    expect(channelsListallV1(user1.authUserId)).toEqual(
      {
        channels: []
      },
    );
  });

  test('Single user with one channel', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats38', 'Alex', 'Good');
    const channelId1 = channelsCreateV1(user1.authUserId, 'New Channel', true);
    expect(channelsListallV1(user1.authUserId)).toStrictEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'New Channel',
          },
        ]
      }
    );
  });

  test('Single user with two channels', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats38', 'Alex', 'Good');
    const channelId1 = channelsCreateV1(user1.authUserId, 'New Channel', true);
    const channelId2 = channelsCreateV1(user1.authUserId, 'Channel Two', true);
    
    expect(channelsListallV1(user1.authUserId)).toStrictEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'New Channel',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Two',
          },
        ]
      }
    );
  });

  test('Single user with both public and private channels', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats38', 'Alex', 'Good');
    const channelId1 = channelsCreateV1(user1.authUserId, 'Channel One', true);
    const channelId2 = channelsCreateV1(user1.authUserId, 'Channel Two', true);
    const channelId3 = channelsCreateV1(user1.authUserId, 'Channel Three', false);

    expect(channelsListallV1(user1.authUserId)).toStrictEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'Channel One',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Two',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Three',
          },
          
        ]
      }
    );
  });

  test('Two users with one channel each', () => {
    const user1 = authRegisterV1('alex@gmail.com', 'ILoveCats38', 'Alex', 'Good');
    const user2 = authRegisterV1('cindy@gmail.com', 'Hahaha', 'Cindy', 'Good');
    const channelId1 = channelsCreateV1(user1.authUserId, 'New Channel', true);
    const channelId2 = channelsCreateV1(user2.authUserId, 'Channel Two', false);
    
    expect(channelsListallV1(user1.authUserId)).toStrictEqual(
      {
        channels: [
          {
            channelId: expect.any(Number),
            name: 'New Channel',
          },
          {
            channelId: expect.any(Number),
            name: 'Channel Two',
          },
        ]
      }
    );
  });
})
