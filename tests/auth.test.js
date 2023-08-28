// Tests for auth
import {
  authRegisterV1,
  authLoginV1,
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

describe('Testing AuthRegisterV1', () => {

  test('AuthRegister: invalid email', () => {
    expect(authRegisterV1('invalidEmail', 'password123', 'firstName', 'lastName')).toMatchObject({ error: 'error' });
  });

  test('AuthRegister: Invalid password (less than 6 characters)', () => {
    expect(authRegisterV1('example@email.com', 'abc', 'firstName', 'lastName')).toMatchObject({ error: 'error' });
  });

  test('AuthRegister: Invalid firstName (empty string)', () => {
    expect(authRegisterV1('example@email.com', 'password123', '', 'lastName')).toMatchObject({ error: 'error' });
  });

  test('AuthRegister: Invalid firstName (greater than 50 characters)', () => {
    expect(authRegisterV1('example@email.com', 'password123', 'aReallyReallyReallyReallyReallyReallyReallyLongFirstName', 'lastName')).toMatchObject({ error: 'error' });
  });

  test('AuthRegister: Invalid lastName (empty string)', () => {
    expect(authRegisterV1('example@email.com', 'password123', 'firstName', '')).toMatchObject({ error: 'error' });
  });

  test('AuthRegister: Invalid lastName (greater than 50 characters)', () => {
    expect(authRegisterV1('example@email.com', 'password123', 'firstName', 'aReallyReallyReallyReallyReallyReallyReallyLongLastName')).toMatchObject({ error: 'error' });
  });

  test('AuthRegister: Correct Return Type (successful creation)', () => {
    const newUser = authRegisterV1('julia255@gmail.com', 'ILoveCats38', 'Julia', 'Sanders');
    expect(newUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );
  });

  test('AuthRegister: User exists after creation', () => {
    const newUser = authRegisterV1('julia255@gmail.com', 'ILoveCats38', 'Julia', 'Sanders');
    expect(newUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );

    const loginAttempt = authLoginV1('julia255@gmail.com', 'ILoveCats38');
    expect(loginAttempt).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );
  });
  
  test('AuthRegister: Correct Details/Handle on creation', () => {
    const newUser = authRegisterV1('julia255@gmail.com', 'ILoveCats38', 'Julia', 'Sanders');
    expect(newUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );

    const userDetails = userProfileV1(newUser.authUserId, newUser.authUserId);
    expect(userDetails).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: newUser.authUserId,
          email: 'julia255@gmail.com',
          nameFirst: 'Julia',
          nameLast: 'Sanders',
          handleStr: 'juliasanders',
        }
      })
    );
  });

  test('AuthRegister: Email address used by another user', () => {
    const newUser = authRegisterV1('bobsmith2@gmail.com', 'bobbyB125', 'Bob', 'Smith');
    expect(newUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );
    expect(authRegisterV1('bobsmith2@gmail.com', 'password123', 'Bobby', 'Poole')).toMatchObject({ error: 'error' });
  });
  
  test('AuthRegister: Handle generated over 20 characters', () => {
    const newUser = authRegisterV1('julia255@gmail.com', 'ILoveCats38', 'Julianarodrigo', 'Sanderson');
    expect(newUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );

    const userDetails = userProfileV1(newUser.authUserId, newUser.authUserId);
    expect(userDetails).toMatchObject({
        user: {
          uId: newUser.authUserId,
          email: 'julia255@gmail.com',
          nameFirst: 'Julianarodrigo',
          nameLast: 'Sanderson',
          handleStr: 'julianarodrigosander',
        }
    });
  });

  test('AuthRegister: Handle taken by another user', () => {
    const newUser = authRegisterV1('julia255@gmail.com', 'ILoveCats38', 'Julia', 'Sanders');
    expect(newUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );

    const secondUser = authRegisterV1('julia356@gmail.com', 'ILoveCats39', 'Julia', 'Sanders');
    expect(secondUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );

    const userDetails = userProfileV1(newUser.authUserId, newUser.authUserId);
    expect(userDetails).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: newUser.authUserId,
          email: 'julia255@gmail.com',
          nameFirst: 'Julia',
          nameLast: 'Sanders',
          handleStr: 'juliasanders',
        }
      })
    );

    const secondUserDetails = userProfileV1(secondUser.authUserId, secondUser.authUserId);
    expect(secondUserDetails).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: secondUser.authUserId,
          email: 'julia356@gmail.com',
          nameFirst: 'Julia',
          nameLast: 'Sanders',
          handleStr: 'juliasanders0',
        }
      })
    );
  });

  test('AuthRegister: 20 character Handle taken by another user / handle case difference', () => {
    const newUser = authRegisterV1('bobby255@gmail.com', 'ILoveCats38', 'BobbySmithSmithSmith', 'Sanders');
    expect(newUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );

    const secondUser = authRegisterV1('jacky356@gmail.com', 'ILoveCats39', 'Bobbysmithsmithsmith', 'Sanders');
    expect(secondUser).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );

    const userDetails = userProfileV1(newUser.authUserId, newUser.authUserId);
    expect(userDetails).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: newUser.authUserId,
          email: 'bobby255@gmail.com',
          nameFirst: 'BobbySmithSmithSmith',
          nameLast: 'Sanders',
          handleStr: 'bobbysmithsmithsmith',
        }
      })
    );

    const secondUserDetails = userProfileV1(secondUser.authUserId, secondUser.authUserId);
    expect(secondUserDetails).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: secondUser.authUserId,
          email: 'jacky356@gmail.com',
          nameFirst: 'Bobbysmithsmithsmith',
          nameLast: 'Sanders',
          handleStr: 'bobbysmithsmithsmith0',
        }
      })
    );
  });
});

describe('Testing AuthLoginV1', () => {

  test('AuthLogin: Email not belong to a registered user', () => {
    expect(authLoginV1('bobby289@gmail.com', 'password123',)).toMatchObject({ error: 'error' });
  });

  test('AuthLogin: Incorrect password', () => {
    const newUser = authRegisterV1('login455@gmail.com', 'loginPassword', 'Login', 'Test');
    expect(authLoginV1('login455@gmail.com', 'incorrectPassword',)).toMatchObject({ error: 'error' });
  });

  test('AuthLogin: Correct Return Type (successful login)', () => {
    const newUser = authRegisterV1('julia255@gmail.com', 'ILoveCats38', 'Julia', 'Sanders');
    const login = authLoginV1('julia255@gmail.com', 'ILoveCats38');
    expect(login).toStrictEqual(
      expect.objectContaining({
        authUserId: expect.any(Number),
      })
    );
  });
});
