import crypto from "crypto";

export function generateOTP(numDigits: number = 4): string {
  if (numDigits < 1) {
    throw new Error("Number of digits must be at least 1");
  }

  // Calculate the range for the OTP
  const max = Math.pow(10, numDigits);
  const min = max / 10;

  // Generate random bytes and convert to a number
  const randomBytes = crypto.randomBytes(
    Math.ceil((numDigits * Math.log2(10)) / 8),
  );
  const otp =
    parseInt(randomBytes.toString("hex").slice(0, numDigits), 16) % max;

  // Convert to string and pad with leading zeros if required
  const otpString = otp.toString().padStart(numDigits, "0");

  return otpString;
}
