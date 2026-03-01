import * as nacl from 'tweetnacl';
import base64url from 'base64url';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QrService {
  verifySignature(
    userId: string,
    timestamp: number,
    signatureBase64: string,
    publicKeyBase64: string,
  ): boolean {
    const message = Buffer.from(`${userId}.${timestamp}`);
    const signature = base64url.toBuffer(signatureBase64);
    const publicKey = base64url.toBuffer(publicKeyBase64);
    return nacl.sign.detached.verify(message, signature, publicKey);
  }

  isTimestampValid(timestamp: number): boolean {
    const now = Date.now();
    const diff = Math.abs(now - timestamp);
    return diff <= 120000;
  }
}
