import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private mailerService: MailerService) {}

  async sendNewEventNotification(
    email: string,
    event_name: string,
    broadcast_message: string,
    qr_code: string,
  ) {
    try {
      const emailResponse = await this.mailerService.sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'UST - Event Announcement',
        template: './new-event', // `.hbs` extension is appended automatically
        context: {
          event_name,
          broadcast_message,
          qr_code,
        },
      });

      this.logger.log(
        `Succesfully sent email: ${JSON.stringify(emailResponse)}`,
      );
    } catch (error) {
      this.logger.error(`Error with sending email ${JSON.stringify(error)}`);
    }
  }

  async sendOtp(email: string, otp: string) {
    try {
      const emailResponse = await this.mailerService.sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'UST - Student OTP',
        template: './send-student-otp', // `.hbs` extension is appended automatically
        context: {
          otp,
        },
      });

      this.logger.log(
        `Succesfully sent email: ${JSON.stringify(emailResponse)}`,
      );
    } catch (error) {
      this.logger.error(`Error with sending email ${JSON.stringify(error)}`);
    }
  }

  async sendResetPassword(email: string, otp: string) {
    try {
      // TODO: update email context to use frontend url with otp on the url path
      const emailResponse = await this.mailerService.sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'UST - Reset Password',
        template: './send-student-otp', // `.hbs` extension is appended automatically
        context: {
          otp,
        },
      });

      this.logger.log(
        `Succesfully sent email: ${JSON.stringify(emailResponse)}`,
      );
    } catch (error) {
      this.logger.error(`Error with sending email ${JSON.stringify(error)}`);
    }
  }
}
