import randomstring from 'randomstring';
import nodemailer from 'nodemailer';
import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { getHashOf } from './auth';

/**
 * For a given email, if a user with that email exists, log out all of the uesr's
 * sessions and send a unique 5 length reset code to the email associated with the account.
 *
 * Arguments:
 *     email (String)   - email associated with account
 *
 * Return Value:
 *     Returns {} regardless of email being sent
 */
function authResetRequest(email: string) {
  const data = getData();
  if (email in data.users) {
    const uId = data.users[email].userId;
    // log out all the users sessions
    for (const token in data.sessions) {
      if (data.sessions[token] === uId) {
        // logout this sessions
        delete data.sessions[token];
      }
    }
    // GENERATE THE RESET CODE
    let code = randomstring.generate({
      length: 5,
      capitalization: 'uppercase',
    });
    while (code in data.resetCodes) {
      // generate resetcodes until an unused one
      code = randomstring.generate({
        length: 5,
        capitalization: 'uppercase',
      });
    }
    data.resetCodes[code] = email;
    setData(data);

    // SEND THE EMAIL HERE
    sendMail(email, code);
  }
  return {};
}

// Sends an email to the given address containing the reset code
function sendMail(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'gmail',
    auth: {
      user: 'treatsemailbot@gmail.com',
      pass: 'alwuprtemnrqcjck'
    },
    // debug: false,
    // logger: true
  });

  const mailOptions = {
    from: 'treatsemailbot@gmail.com',
    to: email,
    subject: '[Treats]: Password reset code',
    text: `Your password reset code is: ${code}`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

/**
 * For a given 5 letter resetCode provided by auth/passwordreset/request/v1,
 * reset the associated users password.
 *
 * Arguments:
 *     resetCode (String)   - reset code emailed to user
 *     newPassword (String) - New password to be used for account
 *
 *
 * Return Value:
 *     Returns {} on success
 *     Throws error on failure:
 *        - Invalid or inactive resetCode
 *        - newPassword is not at least 6 characters long
 */
function authPasswordReset(resetCode: string, newPassword: string) {
  const data = getData();
  if (!(resetCode in data.resetCodes)) {
    // invalid resetCode
    throw HTTPError(400, 'Invalid Reset Code');
  }
  if (newPassword.length < 6) {
    // password less than 6 characters
    throw HTTPError(400, 'Password too short');
  }
  const email = data.resetCodes[resetCode];
  // Update password
  data.users[email].password = getHashOf(newPassword);
  // delete resetCode
  delete data.resetCodes[resetCode];
  setData(data);
  return {};
}

export { authResetRequest, authPasswordReset };
