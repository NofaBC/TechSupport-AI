/**
 * Twilio Client
 * Initialization and helper functions for Twilio Voice & SMS
 */

import twilio from 'twilio';

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }
    
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export function getTwilioPhoneNumber(): string {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!phoneNumber) {
    throw new Error('TWILIO_PHONE_NUMBER not configured');
  }
  return phoneNumber;
}

/**
 * Validate Twilio webhook signature
 */
export function validateTwilioWebhook(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.error('TWILIO_AUTH_TOKEN not set');
    return false;
  }
  
  return twilio.validateRequest(authToken, signature, url, params);
}

/**
 * Send SMS message
 */
export async function sendSMS(
  to: string,
  body: string,
  options?: {
    statusCallback?: string;
    mediaUrl?: string[];
  }
): Promise<string> {
  const client = getTwilioClient();
  
  const message = await client.messages.create({
    to,
    from: getTwilioPhoneNumber(),
    body,
    statusCallback: options?.statusCallback,
    mediaUrl: options?.mediaUrl,
  });
  
  return message.sid;
}

/**
 * Make outbound call
 */
export async function makeCall(
  to: string,
  twimlUrl: string,
  options?: {
    statusCallback?: string;
    timeout?: number;
    record?: boolean;
  }
): Promise<string> {
  const client = getTwilioClient();
  
  const call = await client.calls.create({
    to,
    from: getTwilioPhoneNumber(),
    url: twimlUrl,
    statusCallback: options?.statusCallback,
    timeout: options?.timeout || 30,
    record: options?.record || false,
  });
  
  return call.sid;
}

/**
 * Get call details
 */
export async function getCallDetails(callSid: string) {
  const client = getTwilioClient();
  return client.calls(callSid).fetch();
}

/**
 * Get message details
 */
export async function getMessageDetails(messageSid: string) {
  const client = getTwilioClient();
  return client.messages(messageSid).fetch();
}
