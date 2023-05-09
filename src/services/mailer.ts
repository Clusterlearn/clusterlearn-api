import nodemailer from 'nodemailer'
import { Options } from 'nodemailer/lib/mailer';

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD
    }
});



// send mail with defined transport object
export default async function sendMessage(option: Options){
    return await transporter.sendMail(option);
}