import { authenticator } from 'otplib';
import QRCode from 'qrcode';

/**
 * Generate TOTP secret and QR code for 2FA setup
 */
export async function generateTwoFactorSecret(email: string) {
  try {
    const secret = authenticator.generateSecret();

    const otpauth_url = authenticator.keyuri(email, 'Solid Stock', secret);

    const qrCode = await QRCode.toDataURL(otpauth_url);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    });

    return {
      secret,
      qrCode,
      backupCodes,
    };
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    throw error;
  }
}

/**
 * Verify TOTP token
 */
export function verifyTwoFactorToken(secret: string, token: string) {
  try {
    const isValid = authenticator.check(token, secret);
    return isValid;
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return false;
  }
}

/**
 * Verify backup code
 */
export function verifyBackupCode(backupCodes: string[], code: string) {
  const index = backupCodes.findIndex(c => c === code.toUpperCase());
  if (index === -1) {
    return false;
  }

  // Remove used backup code
  backupCodes.splice(index, 1);
  return true;
}

/**
 * Generate new backup codes
 */
export function generateBackupCodes() {
  return Array.from({ length: 10 }, () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  });
}

export default {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  verifyBackupCode,
  generateBackupCodes,
};
