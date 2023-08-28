import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import request from 'sync-request';
import fs from 'fs';
import { isTokenValid, tokenToAuth } from './auth';
import { checkuId } from './users';
import config from './config.json';
import sharp from 'sharp';

// crop image function
async function cropImage(origImage: string, outputImage: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  try {
    await sharp(origImage)
      .extract({ width: xEnd - xStart, height: yEnd - yStart, left: xStart, top: yStart })
      .toFile(outputImage);
    console.log('Crop image');
  } catch (error) {
    console.log(error);
  }
}

// program to get the dimensions of an image
async function getMetadata(xStart: number, yStart: number, xEnd: number, yEnd: number, handle: string) {
  const metadata = await sharp('src/userProfilePhotos/0.jpg').metadata();
  if (xStart < 0 || xEnd > metadata.width || yStart < 0 || yEnd > metadata.height) {
    throw HTTPError(400, 'Any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL');
  }
  cropImage('src/userProfilePhotos/0.jpg', `src/userProfilePhotos/${handle}.jpg`, xStart, yStart, xEnd, yEnd);
}

function userProfileUploadphotoV1(imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number, token: string) {
  const data = getData();

  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!(imgUrl.endsWith('.jpg'))) {
    throw HTTPError(400, 'Image uploaded is not a JPG');
  }

  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'xEnd is less than or equal to xStart or yEnd is less than or equal to yStart');
  }

  const res = request(
    'GET',
    imgUrl
  );
  if (res.statusCode !== 200) {
    throw HTTPError(400, 'Error occurred when attempting to retrieve image');
  }
  const body = res.getBody();

  const userId = tokenToAuth(token);
  const email = checkuId(userId);
  if (email !== 'false' && email !== 'removed') {
    const handle = data.users[email].userHandle;
    fs.writeFileSync('src/userProfilePhotos/0.jpg', body, { flag: 'w' });

    getMetadata(xStart, yStart, xEnd, yEnd, handle);

    data.users[email].profileImgUrl = `${config.url}:${config.port}/imgurl/${handle}.jpg`;
  }
  setData(data);
  return {};
}

export { userProfileUploadphotoV1 };
