// import { token } from 'morgan';
// import { authRegisterV2 } from './auth';
// import { authRegister } from './auth-login.test';
// import { channelMessagesV2 } from './channel';
// import { channelsCreateV2 } from './channels';
// import { channelsCreateReq } from './channelsCreate.test';
// import { getData } from './dataStore';
// import { DMCreateV1, DMDetailsV1, DMLeaveV1, DMListV1 } from './dm';
// import { messageSendV1 } from './message';

// const data = getData();
// const a1 = authRegisterV2('john.smith@gmail.com', 'hunter2', 'John', 'Smith');
// const a2 = authRegisterV2('pasl.smith@gmail.com', 'hunter2', 'Pasl', 'Smith');
// const a3 = authRegisterV2('bris.smith@gmail.com', 'hunter2', 'Bris', 'Smith');
// const c1 = channelsCreateV2(a1.token, 'jokes', true).channelId;

// // const d1 = DMCreateV1(a1, [a2.authUserId, a3.authUserId]).dmId;
// // const d2 = DMDetailsV1(a1, d1);

// // console.log(d2);

// // for (let i = 0; i < 100; i++) {
// //   messageSendV1(a1, c1, 'loll' + String(i));
// // }
// // const te = [...data.channels[0].messages];

// // te.reverse();

// // const test = te.slice(75, 125);
// // if (test[test.length - 1].messageId === 1) {
// //   console.log('LMAO');
// // }
// // const m1 = channelMessagesV2(a1, c1, 99);
// // console.log(m1);

// const d = DMCreateV1(a1.token, [a2.authUserId]).dmId;
// const d1 = DMCreateV1(a2.token, [a1.authUserId]).dmId;
// console.log(DMDetailsV1(a1.token, d));
// console.log(DMDetailsV1(a1.token, d1));
// console.log(DMLeaveV1(a1.token, d1));
// console.log(DMLeaveV1(a1.token, d));
// const a = DMListV1(a1.token);
// console.log(a);
