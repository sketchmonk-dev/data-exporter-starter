import { createTransport, type Transporter } from "nodemailer";
import { getConfig } from "../config";
import { getObjectSignedUrl } from "./storage";

/**
 * Create a mailer transport
 * @returns The mailer transport
 */
export function createMailerTransport() {
    const config = getConfig();
    return createTransport(config.mailer);
}

type Attachment = NonNullable<Parameters<Transporter['sendMail']>[0]['attachments']>[0];
/**
 * Create mailer attachments from object keys
 * @param keys The keys of the objects to create attachments from
 * @param contentType The content type of the attachments
 * @returns The attachments created from the keys
 */
export async function createAttachmentsFromKeys(keys: string[], contentType: string = 'text/csv'): Promise<Attachment[]> {
    return await Promise.all(
        keys.map(async key => ({
            filename: key.split('/').pop() as string,
            path: await getObjectSignedUrl(key),
            contentType
        }))
    );
}

interface ISendMailParams {
    to: string[];
    subject: string;
    text: string;
    cc?: string[];
    bcc?: string[];
    attachments: Attachment[];
}
/**
 * Send a mail with the given parameters
 * @param to The email addresses to send the mail to
 * @param subject The subject of the mail
 * @param text The text content of the mail
 * @param attachments The attachments to include in the mail
 */
export async function sendMail({
    to,
    subject,
    text,
    attachments = [],
    cc,
    bcc
}: ISendMailParams) {
    const transporter = createMailerTransport();
    await transporter.sendMail({
        from: getConfig().mailer.auth.user,
        to,
        cc,
        bcc,
        subject,
        text,
        attachments
    });
}