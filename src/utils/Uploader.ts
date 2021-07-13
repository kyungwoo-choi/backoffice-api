import path from 'path'
import multer from 'multer';
import s3Storage from 'multer-s3';
import {Request, Response} from 'express'


import AWS from 'aws-sdk'

import uuid from "./uuid";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export default class Uploader {
  private readonly s3: any;
  private readonly upload: any;
  private worker: any;

  constructor(_path: string, type: string = 'any', fieldsData: string = 'images', maxCount: number = 1, key?: string) {
    this.s3 = new AWS.S3();

    const uploadKey = `${_path}${key}`;

    this.upload = multer({
      storage: s3Storage({
        s3: this.s3,
        bucket: process.env.S3_BUCKET || '',
        key: async function (req, file, cb) {
          const filename = uuid.decode(uuid.v1());
          let extension = path.extname(file.originalname);
          cb(null, uploadKey + filename + extension)
        }
      })
    });

    this.worker = this.upload[type](fieldsData, maxCount)
  }

  run(req: Request, res: Response) {
    if (!req || !res) {
      throw {
        message: 'request, response object must be passed'
      }
    }

    return new Promise((resolve, reject) => {
      this.worker(req, res, function (err: any) {
        if (err) {
          return reject(err);
        }

        resolve({
          req,
          res
        });
      })
    });
  }
}


