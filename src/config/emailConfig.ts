import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// MailConfig class to handle email configuration and sending
export class MailConfig {

    private transporter;
    private defaultRecipient: string;

    constructor() {

        console.log("env", process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.EMAIL_USER, process.env.EMAIL_PASSWORD);

        // Create a nodemailer transporter with the SMTP settings
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // SMTP host (default: smtp.abv.bg)
            port: parseInt(process.env.SMTP_PORT || '465'), // SMTP port (default: 465)
            secure: true,
            auth: {
                user: process.env.EMAIL_USER, // Email user (sender)
                pass: process.env.EMAIL_PASSWORD // Email password
            }
        } as nodemailer.TransportOptions);

        this.defaultRecipient = process.env.EMAIL_USER as string; // Set the default recipient as the email user
    }

    async sendMessage(subject: string, content: string, recipient: string = this.defaultRecipient) {
        // Send an email message with the provided subject, content, and recipient

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: recipient, // Recipient address
            subject: subject, // Email subject
            text: content // Email content
        };

        // Try to send the email
        try {

            const info = await this.transporter.sendMail(mailOptions); // Send the email using the transporter
            console.log('Message sent: %s', info.messageId); // Log the message ID

            return info; // Return the email sending information
        } 
        
        // Catch any errors during sending
        catch (error) 
        {
            console.error('Failed to send email:', error); // Log the error if sending fails
            throw error; // Throw the error to be handled by the caller
        }
    }

    async sendMessageBulk(subject: string, content: string, recipients: string[]) {

        const mailOptions: any = {
            from: process.env.EMAIL_USER, // Sender address
            subject: subject, // Email subject
            text: content // Email content,
        };

        for (const recipient of recipients) {

            mailOptions.to = recipient; // Set the recipient for each email

            // Catch any errors during sending
            try {

                const info = await this.transporter.sendMail(mailOptions); // Send the email using the transporter
                console.log('Message sent: %s', info.messageId); // Log the message ID

                return info; // Return the email sending information
            }

            // Catch any errors during sending
            catch (error)
            {
                console.error('Failed to send email:', error); // Log the error if sending fails
                throw error; // Throw the error to be handled by the caller
            }
        }   
    }
}