import express, { Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { channelsCreateV2, channelsListV2, channelsListallV2 } from './channels';
import { channelAddownerV1, channelDetailsV2, channelInviteV3, channelJoinV3, channelLeaveV1, channelMessagesV2, channelRemoveOwnerV1 } from './channel';
import { clearV1 } from './other';
import { searchV1 } from './search';
import { authRegisterV2, authLoginV2, authLogoutV1 } from './auth';
import errorHandler from 'middleware-http-errors';
import { saveData, loadData } from './dataStore';
import { adminUserpermissionChangeV1, adminUserRemoveV1 } from './admin';
import { DMCreateV1, DMDetailsV1, DMLeaveV1, DMListV1, DMMessagesV1, DMRemoveV1, messageSendDmV2 } from './dm';
import { userProfileV2, usersAllV2, userProfileSethandleV2, userProfileSetnameV2, setEmail, userStatsV1, usersStatsV1 } from './users';
import { messageSendLaterV1, messageEditV1, messageRemoveV1, messageSendV1, messageShareV1, messageSendLaterDmV1, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1 } from './message';
import { notificationsGetV1 } from './notifications';
import { userProfileUploadphotoV1 } from './photos';
import { authPasswordReset, authResetRequest } from './auth-passwords';
import { standUpStart, standUpActive, standUpSend } from './standUp';

// Set up web app, use JSON
const app = express();
app.use(express.json());

// Use middleware that allows for access from other domains (needed for frontend to connect)
app.use(cors());
// (OPTIONAL) Use middleware to log (print to terminal) incoming HTTP requests
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// const a1 = authRegisterV1('john.smith@gmail.com', 'hunter2', 'John', 'Smith').authUserId;
// const c = channelsCreateV1(a1, 'LOOOOL', true);

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// join channel
app.post('/channel/join/v3', (req, res, next) => {
  const token = req.header('token') as string;
  const { channelId } = req.body;
  res.json(channelJoinV3(token, channelId));
  saveData();
});

// invite to a channel
app.post('/channel/invite/v3', (req, res, next) => {
  const token = req.header('token') as string;
  const { channelId, uId } = req.body;
  res.json(channelInviteV3(token, parseInt(channelId), parseInt(uId)));
  saveData();
});

app.post('/channels/create/v3', (req, res, next) => {
  try {
    const token = req.header('token') as string;
    const { name, isPublic } = req.body;
    res.json(channelsCreateV2(token, name, isPublic));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req, res) => {
  const token = req.header('token');
  res.json(channelsListV2(token));
  saveData();
});

app.get('/channels/listall/v3', (req, res) => {
  const token = req.header('token');
  res.json(channelsListallV2(token));
});

app.get('/channel/details/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const channelId = parseInt(req.query.channelId as string);
    res.json(channelDetailsV2(token, channelId));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId } = req.body;
    res.json(channelLeaveV1(token, parseInt(channelId)));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    res.json(channelAddownerV1(token, channelId, uId));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    res.json(channelRemoveOwnerV1(token, channelId, uId));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const channelId = parseInt(req.query.channelId as string);
    const start = parseInt(req.query.start as string);
    res.json(channelMessagesV2(token, channelId, start));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { uIds } = req.body;
    res.json(DMCreateV1(token, uIds));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    res.json(DMListV1(token));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    res.json(DMRemoveV1(token, dmId));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    res.json(DMDetailsV1(token, dmId));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    res.json(DMMessagesV1(token, dmId, start));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { dmId } = req.body;
    res.json(DMLeaveV1(token, parseInt(dmId)));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, message } = req.body;
    res.json(messageSendV1(token, channelId, message));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', (req, res) => {
  const token = req.header('token');
  const { messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
  saveData();
});

app.delete('/message/remove/v2', (req, res) => {
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV1(token, messageId));
  saveData();
});

app.post('/message/share/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { ogMessageId, message, channelId, dmId } = req.body;
    res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, message, timeSent } = req.body;
    res.json(messageSendLaterV1(token, channelId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { dmId, message, timeSent } = req.body;
    res.json(messageSendLaterDmV1(token, dmId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId, reactId } = req.body;
    res.json(messageReactV1(token, messageId, reactId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId, reactId } = req.body;
    res.json(messageUnreactV1(token, messageId, reactId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId } = req.body;
    res.json(messagePinV1(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { messageId } = req.body;
    res.json(messageUnpinV1(token, messageId));
  } catch (err) {
    next(err);
  }
});

// clear route
app.delete('/clear/v1', (req: Request, res: Response) => {
  res.json(clearV1());
  saveData();
});

// register route
app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const newUser = authRegisterV2(email, password, nameFirst, nameLast);
  res.json(newUser);
  saveData();
});

// login route
app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const login = authLoginV2(email, password);
  res.json(login);
  saveData();
});

// users all request
app.get('/users/all/v2', (req, res) => {
  const token = req.headers.token as string;
  res.json(usersAllV2(token));
  saveData();
});

// logout route
app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const logout = authLogoutV1(token);
  res.json(logout);
  saveData();
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  const reset = authResetRequest(email);
  res.json(reset);
  saveData();
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  const reset = authPasswordReset(resetCode, newPassword);
  res.json(reset);
  saveData();
});

// userProfile route
app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const uId = req.query.uId as string;
  const user = userProfileV2(token, parseInt(uId));
  res.json(user);
  saveData();
});

// userProfileSethandleV1 route
app.put('/user/profile/sethandle/v2', (req, res) => {
  const token = req.header('token');
  const { handleStr } = req.body;
  res.json(userProfileSethandleV2(token, handleStr));
  saveData();
});

// userProfileSetnameV1 route
app.put('/user/profile/setname/v2', (req, res) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;
  res.json(userProfileSetnameV2(token, nameFirst, nameLast));
  saveData();
});

// userPofileSetEmailV1 route
app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const { email } = req.body;
  const token = req.headers.token as string;
  const result = setEmail(token, email);
  res.json(result);
  saveData();
});

// send DM's route
app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { dmId, message } = req.body;
  res.json(messageSendDmV2(token, dmId, message));
  saveData();
});

// change user permission route
app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { uId, permissionId } = req.body;
  res.json(adminUserpermissionChangeV1(parseInt(uId), parseInt(permissionId), token));
  saveData();
});

// remove user route
app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const uId = parseInt(req.query.uId as string);
  res.json(adminUserRemoveV1(uId, token));
  saveData();
});

app.get('/user/stats/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    res.json(userStatsV1(token));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.get('/users/stats/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    res.json(usersStatsV1(token));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.get('/search/v1', (req, res, next) => {
  try {
    const queryStr = req.query.queryStr as string;
    const token = req.headers.token as string;
    res.json(searchV1(queryStr, token));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.get('/notifications/get/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    res.json(notificationsGetV1(token));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.headers.token as string;
    const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
    res.json(userProfileUploadphotoV1(imgUrl, parseInt(xStart), parseInt(yStart), parseInt(xEnd), parseInt(yEnd), token));
    saveData();
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { channelId, length } = req.body;
  res.json(standUpStart(token, channelId, length));
  saveData();
});

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const channelId = parseInt(req.query.channelId as string);
  res.json(standUpActive(token, channelId));
  saveData();
});

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { channelId, message } = req.body;
  res.json(standUpSend(token, channelId, message));
  saveData();
});

app.use('/imgurl', express.static('src/userProfilePhotos'));

// handles errors nicely
app.use(errorHandler());

// for logging errors
app.use(morgan('dev'));

// Load saved data once server starts
// LOAD SAVED DATA TO IN MEMORY DATA, only need to do once here per server session
// we call saveData at the end of our put, post, delete routes to save our current in memory
// data to the file data.json.
loadData();

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
