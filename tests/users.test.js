// Tests for users
import {
  authRegisterV1,
} from '../src/auth'
  
import {
  clearV1,
} from '../src/other'
  
import {
  userProfileV1,
} from '../src/users'

beforeEach(() => {
  clearV1();
});

describe('Testing userProfileV1', () => {

  test('userProfile: invalid Id', () => {
    expect(userProfileV1(99, 99)).toMatchObject({ error: 'error' });
  });

  test('userProfile: Attempting to view invalid id', () => {
    const newUser = authRegisterV1('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    expect(userProfileV1(newUser.authUserId, 99)).toMatchObject({ error: 'error' });
  });

  test('userProfile: invalid authId', () => {
    const newUser = authRegisterV1('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    expect(userProfileV1(99, newUser.authUserId)).toMatchObject({ error: 'error' });
  });

  test('userProfile: succesful return type', () => {
    const newUser = authRegisterV1('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const userDetails = userProfileV1(newUser.authUserId, newUser.authUserId);
    expect(userDetails).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: newUser.authUserId,
          email: 'billybob242@gmail.com',
          nameFirst: 'Billy',
          nameLast: 'Bob',
          handleStr: 'billybob',
        }
      })
    );
  });

  test('userProfile: valid user viewing another user profile', () => {
    const newUser = authRegisterV1('billybob242@gmail.com', 'password123', 'Billy', 'Bob');
    const newViewer = authRegisterV1('jane48@gmail.com', 'dogsncats34', 'Jane', 'Apple');
    const userDetails = userProfileV1(newViewer.authUserId, newUser.authUserId);
    expect(userDetails).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: newUser.authUserId,
          email: 'billybob242@gmail.com',
          nameFirst: 'Billy',
          nameLast: 'Bob',
          handleStr: 'billybob',
        }
      })
    );
  });
});
