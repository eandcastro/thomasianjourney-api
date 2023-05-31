import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

// TODO: generate reports here
@Injectable()
export class ReportsService {
  async createEventPdf(
    event_id: string,
    event_title: string,
    file_path: string,
    base_path: string,
  ) {
    console.log('Creating event pdf doc...');
    const pdfDoc = await PDFDocument.create();

    // const qr_code_image = await fetch(event_qr).then((res) =>
    //   res.arrayBuffer(),
    // );

    const imageBuffer = await fs.readFile(`${file_path}`);

    const pngImage = await pdfDoc.embedPng(imageBuffer);

    const jpgDims = pngImage.scale(0.5);

    const page = pdfDoc.addPage();

    page.drawImage(pngImage, {
      x: page.getWidth() / 2 - jpgDims.width / 2,
      y: page.getHeight() / 2 - jpgDims.height / 2 + 250,
      width: jpgDims.width,
      height: jpgDims.height,
    });

    await fs.writeFile(
      `${base_path}/${event_id}-qr_doc.pdf`,
      await pdfDoc.save(),
    );
  }
}
