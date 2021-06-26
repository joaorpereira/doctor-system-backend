/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
import dotenv from "dotenv";
import AWS from "aws-sdk";

dotenv.config();

type IBucketParams = {
  Bucket: string;
  Key: string;
  Body: Record<string, unknown>;
  ACL: string;
};

type IAWSPromise = {
  file?: string;
  error?: string;
};

type IAWSParams = {
  file: any;
  path: string;
  acl?: string;
};

const accessKeyId = process.env.IAM_USER_KEY as string;
const secretAccessKey = process.env.IAM_USER_SECRET as string;
const bucketName = process.env.BUCKET_NAME as string;

export const uploadToS3 = ({ file, path, acl = "public-read" }: IAWSParams) => {
  return new Promise<IAWSPromise>((resolve, reject) => {
    const s3bucket = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      params: { Bucket: bucketName },
    });

    s3bucket.createBucket(() => {
      const params: IBucketParams = {
        Bucket: bucketName,
        Key: path,
        Body: file.data,
        ACL: acl,
      };

      s3bucket.upload(params, (err: any, data: any) => {
        if (err) return resolve({ error: err });
        return resolve({ file: data });
      });
    });
  });
};

export const deleteFileS3 = (key: string) => {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      params: { Bucket: bucketName },
      // eslint-disable-next-line @typescript-eslint/ban-types
    } as Object);

    s3bucket.createBucket(() => {
      s3bucket.deleteObject(
        {
          Bucket: bucketName,
          Key: key,
        },
        (err, data) => {
          if (err) {
            console.log(err);
            return resolve({ error: err });
          }
          console.log(data);
          return resolve({ file: data });
        }
      );
    });
  });
};
