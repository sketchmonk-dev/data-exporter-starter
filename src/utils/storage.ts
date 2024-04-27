import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PassThrough, Readable } from "stream";
import { getConfig } from "../config";

/**
 * Create a new S3 client
 * @returns A new S3 client
 */
export function createS3Client() {
    const config = getConfig();
    return new S3({
        region: config.s3.region,
        credentials: config.s3.credentials
    });
}

/**
 * Read an object from S3 and return as stream
 * @param key The key of the object to read
 * @returns The stream of the object
 */
export async function readObjectAsStream(key: string): Promise<Readable> {
    const client = createS3Client();
    const config = getConfig();
    const response = await client.getObject({
        Bucket: config.s3.bucketName,
        Key: key
    });
    return response.Body as Readable;
}

/**
 * Generate a signed url for an object in S3 (valid for a week)
 * @param key The key of the object to get the signed url for
 * @returns The signed url for the object
 */
export async function getObjectSignedUrl(key: string): Promise<string> {
    const client = createS3Client();
    const config = getConfig();
    const command = new GetObjectCommand({
        Bucket: config.s3.bucketName,
        Key: key
    });
    return getSignedUrl(client, command, { expiresIn: 3600 * 24 * 7 }); // valid for a week
}

export function createUploadStream(key: string) {
    const client = createS3Client();
    const config = getConfig();
    // create a pass-through stream to write and read data
    const stream = new PassThrough();
    // we will create a writable stream and use it to fill our buffer
    const upload = new Upload({
        client,
        params: {
            Bucket: config.s3.bucketName,
            Key: key,
            Body: stream
        }
    });

    return { stream, upload };
}