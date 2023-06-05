import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config as awsConfig } from 'aws-sdk';
import fs from 'fs/promises';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Thomasian Journey API')
    .setDescription('Thomasian Journey API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  awsConfig.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  });

  // This will serve as the temp folder for qr code
  const uploadFolderName = `${__dirname}/event/temp-upload`;
  const downloadFolderName = `${__dirname}/event/temp-download`;

  try {
    const uploadDirExists = await fs.stat(uploadFolderName);
    const downloadDirExists = await fs.stat(downloadFolderName);
    uploadDirExists.isDirectory();
    downloadDirExists.isDirectory();
  } catch (error) {
    if (error.code == 'ENOENT') {
      await fs.mkdir(uploadFolderName);
      await fs.mkdir(downloadFolderName);
    }
  }

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // Enable CORS, Disable this when running the frontend web/mobile locally
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
