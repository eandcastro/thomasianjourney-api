import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
// TODO: generate reports here
@Injectable()
export class ReportsService {
  async createEventPdf(event_title: string, event_qr: string) {
    const pdfDoc = await PDFDocument.create();

    const qr_code_image = await fetch(event_qr).then((res) =>
      res.arrayBuffer(),
    );

    const jpgImage = await pdfDoc.embedJpg(qr_code_image);

    const jpgDims = jpgImage.scale(0.5);

    const page = pdfDoc.addPage();

    page.drawImage(jpgImage, {
      x: page.getWidth() / 2 - jpgDims.width / 2,
      y: page.getHeight() / 2 - jpgDims.height / 2 + 250,
      width: jpgDims.width,
      height: jpgDims.height,
    });

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  }
}
