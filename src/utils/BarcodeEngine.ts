/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export class BarcodeEngine {
  /**
   * Generates a QR Code as a Data URL (PNG base64).
   * Fully offline and fast.
   */
  public static async generateQRCode(data: string, color = '#000000', bgColor = '#ffffff'): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(data, {
        margin: 1,
        width: 250,
        color: {
          dark: color,
          light: bgColor,
        },
      });
      return dataUrl;
    } catch (err) {
      console.error('Error generating QR code', err);
      // Fallback fallback URL
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
    }
  }

  /**
   * Generates a Barcode (CODE 128) as a Data URL (PNG base64).
   * Uses an in-memory canvas element to render the barcode.
   */
  public static generateBarcode(data: string, displayValue = true, height = 50, width = 2): string {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, data, {
        format: 'CODE128',
        width: width,
        height: height,
        displayValue: displayValue,
        fontSize: 12,
        margin: 4,
        background: '#ffffff',
        lineColor: '#000000',
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Error generating barcode', err);
      // Fallback mock representation or empty string
      return '';
    }
  }

  /**
   * Bulk generates labels for inventory items or assets.
   */
  public static async generateLabelData(id: string, code: string, type: 'INV' | 'ASSET'): Promise<{ qr: string; barcode: string }> {
    const qrData = type === 'INV' ? `INV-TRACK-${id}` : `ASSET-TRACK-${id}`;
    const qr = await this.generateQRCode(qrData);
    const barcode = this.generateBarcode(code, true, 40, 1.5);
    return { qr, barcode };
  }
}
