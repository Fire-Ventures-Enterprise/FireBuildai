import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromPhoneNumber) {
  console.warn('Twilio credentials not found. SMS functionality will be disabled.');
}

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    if (!twilioClient || !fromPhoneNumber) {
      console.error('Twilio not configured. Cannot send SMS.');
      return false;
    }

    // Send actual SMS via Twilio
    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: phone
    });

    console.log(`SMS sent successfully to ${phone}. Message SID: ${messageResponse.sid}`);
    return true;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return false;
  }
}