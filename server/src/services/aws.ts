import dotenv from 'dotenv'
import AWS from 'aws-sdk'

dotenv.config()

export interface IParams {
  Bucket: string
  Key: string
  Body: Object
  ACL: string
}

export interface IPromise {
  file?: string
  error?: string
}

const accessKeyId = process.env.IAM_USER_KEY as string
const secretAccessKey = process.env.IAM_USER_SECRET as string
const bucketName = process.env.BUCKET_NAME as string

export const uploadToS3 = (
  file: any,
  filename: string,
  acl = 'public-read'
) => {
  return new Promise<IPromise>((resolve, reject) => {
    let s3bucket = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      params: { Bucket: bucketName },
    } as Object)

    s3bucket.createBucket(() => {
      const params: IParams = {
        Bucket: bucketName,
        Key: filename,
        Body: file.data,
        ACL: acl,
      }

      s3bucket.upload(params, (err: any, data: any) => {
        if (err) return resolve({ error: err })
        return resolve({ file: data })
      })
    })
  })
}

export const deleteFileS3 = (key: string) => {
  return new Promise((resolve, reject) => {
    let s3bucket = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      params: { Bucket: bucketName },
    } as Object)

    s3bucket.createBucket(() => {
      s3bucket.deleteObject(
        {
          Bucket: bucketName,
          Key: key,
        },
        function (err, data) {
          if (err) {
            console.log(err)
            return resolve({ error: err})
          }
          console.log(data)
          return resolve({ file: data })
        }
      )
    })
  })
}
