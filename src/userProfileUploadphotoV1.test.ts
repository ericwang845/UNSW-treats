import request from 'sync-request';
import config from './config.json';

const ERROR = 400;
const AUTH_ERROR = 403;
const port = config.port;
const url = config.url;

// Wrapper function to send register http requests
function postAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      },
    }
  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

// upload photo request
function uploadPhotoReq(imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number, token: string) {
  try {
    const res = request(
      'POST',
        `${config.url}:${config.port}/user/profile/uploadphoto/v1`,
        {
          json: {
            imgUrl: imgUrl,
            xStart: xStart,
            yStart: yStart,
            xEnd: xEnd,
            yEnd: yEnd,
          },
          headers: {
            token: token,
          }
        }
    );
    return {
      body: JSON.parse(res.getBody() as string),
      statusCode: res.statusCode,
    };
  } catch (err) {
    return { statusCode: err.statusCode };
  }
}

// Wrapper function to send clear http request
function clear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {}
  );
  return {
    body: JSON.parse(res.getBody() as string),
    statusCode: res.statusCode,
  };
}

beforeEach(() => {
  clear();
});

afterEach(() => {
  clear();
});

describe('Testing /user/profile/uploadphoto/v1', () => {
  test('/user/profile/uploadphoto/v1: Success -> Uploaded Photo', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const uploadPhoto = uploadPhotoReq('http://i.4cdn.org/co/1658986188612175.jpg', 1, 1, 100, 100, newUser.body.token);
    expect(uploadPhoto.statusCode).toBe(200);
    expect(uploadPhoto.body).toEqual({});
  });
  test('/user/profile/uploadphoto/v1: Failure -> Invalid token', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const uploadPhoto = uploadPhotoReq('http://someimgurl.jpg', 1, 1, 100, 100, newUser.body.token + 'YOYOYO');
    expect(uploadPhoto.statusCode).toBe(AUTH_ERROR);
  });
  test('/user/profile/uploadphoto/v1: Failure -> Image uploaded is not a JPG', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const uploadPhoto = uploadPhotoReq('http://someimgurl.png', 1, 1, 100, 100, newUser.body.token);
    expect(uploadPhoto.statusCode).toBe(ERROR);
  });
  test('/user/profile/uploadphoto/v1: Failure -> xEnd is less than or equal to xStart', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const uploadPhoto = uploadPhotoReq('http://someimgurl.jpg', 100, 1, 1, 100, newUser.body.token);
    expect(uploadPhoto.statusCode).toBe(ERROR);
  });
  test('/user/profile/uploadphoto/v1: Failure -> yEnd is less than or equal to yStart', () => {
    const newUser = postAuthRegister('billybob242@gmail.com', 'password123', 'global', 'owner');
    const uploadPhoto = uploadPhotoReq('http://someimgurl.jpg', 1, 100, 100, 1, newUser.body.token);
    expect(uploadPhoto.statusCode).toBe(ERROR);
  });
});
