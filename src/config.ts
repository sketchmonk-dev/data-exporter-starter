import { config } from 'dotenv';
import { z } from 'zod';
config();

const configSchema = z.object({
    temporal: z.object({
        address: z.string(),
    }),
    database: z.object({
        url: z.string()
    }),
    mailer: z.union([
        z.object({
            type: z.literal('smtp'),
            from: z.string(),
            options: z.object({
                host: z.string(),
                port: z.number(),
                auth: z.object({
                    user: z.string(),
                    pass: z.string()
                }),
            })
        }),
        z.object({
            type: z.literal('ses'),
            from: z.string(),
            options: z.object({
                apiVersion: z.string().default('2010-12-01'),
                region: z.string(),
                credentials: z.object({
                    accessKeyId: z.string(),
                    secretAccessKey: z.string()
                }),
            })
        })
    ]),
    s3: z.object({
        region: z.string(),
        credentials: z.object({
            accessKeyId: z.string(),
            secretAccessKey: z.string()
        }),
        bucketName: z.string()
    }),
    novu: z.object({
        apiKey: z.string(),
    }),
});

export type Config = z.infer<typeof configSchema>;
export function getConfig(): Config {
    const env = process.env;
    const mailerType = env.MAILER_TYPE as 'smtp' | 'ses' ?? 'smtp';
    const parsedConfig = configSchema.parse({
        temporal: {
            address: env.TEMPORAL_SERVER_ADDRESS
        },
        database: {
            url: env.DATABASE_URL
        },
        mailer: {
            type: mailerType,
            from: env.MAILER_FROM,
            options: mailerType === 'ses' ? {
                apiVersion: env.MAILER_SES_API_VERSION,
                region: env.MAILER_SES_REGION,
                credentials: {
                    accessKeyId: env.MAILER_SES_ACCESS_KEY_ID,
                    secretAccessKey: env.MAILER_SES_SECRET_ACCESS_KEY
                },
                
            } : {
                host: env.MAILER_HOST,
                port: Number(env.MAILER_PORT),
                auth: {
                    user: env.MAILER_AUTH_USER,
                    pass: env.MAILER_AUTH_PASSWORD
                },
            }
        },
        s3: {
            region: env.AWS_S3_REGION,
            credentials: {
                accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
            },
            bucketName: env.AWS_S3_BUCKET_NAME
        },
        novu: {
            apiKey: env.NOVU_API_KEY
        }
    } );
    return parsedConfig;
}