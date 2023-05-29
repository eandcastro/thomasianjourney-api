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
}