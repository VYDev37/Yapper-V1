import nodemailer from "nodemailer";
import config from '../app.config';

interface SendMailParams {
    targetMail?: string;
    subject?: string;
    content?: string;
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: Bun.env.EMAIL_USER,
        pass: Bun.env.EMAIL_PASS
    }
});

const SendMail = async ({ targetMail, subject, content }: SendMailParams): Promise<void> => {
    const info = await transporter.sendMail({
        from: `${config.app_name} System <no-reply@yapper.com>`,
        to: targetMail,
        subject,
        text: content
    });

    console.log("Message sent:", info.messageId);
}

export default SendMail;