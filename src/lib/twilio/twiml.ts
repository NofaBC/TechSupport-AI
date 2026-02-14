/**
 * TwiML Builder
 * Helper functions for generating TwiML responses
 */

import { twiml } from 'twilio';

export interface VoiceResponseOptions {
  language?: string;
  voice?: string;
  loop?: number;
}

// Voice settings for different languages
const VOICE_SETTINGS: Record<string, { voice: string; language: string }> = {
  en: { voice: 'Polly.Joanna', language: 'en-US' },
  fr: { voice: 'Polly.Celine', language: 'fr-FR' },
  de: { voice: 'Polly.Vicki', language: 'de-DE' },
  it: { voice: 'Polly.Carla', language: 'it-IT' },
  zh: { voice: 'Polly.Zhiyu', language: 'cmn-CN' },
  fa: { voice: 'Polly.Joanna', language: 'en-US' }, // Fallback for Farsi
};

/**
 * Get voice settings for a language
 */
export function getVoiceSettings(lang: string): { voice: string; language: string } {
  return VOICE_SETTINGS[lang] || VOICE_SETTINGS.en;
}

/**
 * Create a voice response with speech
 */
export function createSpeechResponse(
  message: string,
  options?: VoiceResponseOptions & {
    gatherInput?: {
      action: string;
      method?: 'GET' | 'POST';
      timeout?: number;
      speechTimeout?: string;
      input?: ('speech' | 'dtmf')[];
    };
  }
): string {
  const response = new twiml.VoiceResponse();
  const lang = options?.language || 'en';
  const voiceSettings = getVoiceSettings(lang);
  
  if (options?.gatherInput) {
    const gather = response.gather({
      action: options.gatherInput.action,
      method: options.gatherInput.method || 'POST',
      timeout: options.gatherInput.timeout || 5,
      speechTimeout: options.gatherInput.speechTimeout || 'auto',
      input: options.gatherInput.input || ['speech', 'dtmf'],
    });
    
    gather.say(
      { voice: (options?.voice || voiceSettings.voice) as 'Polly.Joanna' },
      message
    );
  } else {
    response.say(
      {
        voice: (options?.voice || voiceSettings.voice) as 'Polly.Joanna',
        loop: options?.loop || 1,
      },
      message
    );
  }
  
  return response.toString();
}

/**
 * Create initial greeting for inbound call
 */
export function createCallGreeting(
  language: string,
  gatherActionUrl: string
): string {
  const greetings: Record<string, string> = {
    en: "Welcome to TechSupport AI. I'm your virtual assistant. Please describe your issue after the tone, or press 1 to speak with a human agent.",
    fr: "Bienvenue chez TechSupport AI. Je suis votre assistant virtuel. Veuillez décrire votre problème après le bip, ou appuyez sur 1 pour parler à un agent humain.",
    de: "Willkommen bei TechSupport AI. Ich bin Ihr virtueller Assistent. Bitte beschreiben Sie Ihr Problem nach dem Ton, oder drücken Sie 1, um mit einem menschlichen Agenten zu sprechen.",
    it: "Benvenuto in TechSupport AI. Sono il tuo assistente virtuale. Descrivi il tuo problema dopo il segnale, o premi 1 per parlare con un agente umano.",
    zh: "欢迎使用TechSupport AI。我是您的虚拟助手。请在提示音后描述您的问题，或按1与人工客服交谈。",
    fa: "به TechSupport AI خوش آمدید. من دستیار مجازی شما هستم. لطفاً مشکل خود را پس از صدای بوق شرح دهید، یا برای صحبت با یک نماینده انسانی 1 را فشار دهید.",
  };
  
  const greeting = greetings[language] || greetings.en;
  
  return createSpeechResponse(greeting, {
    language,
    gatherInput: {
      action: gatherActionUrl,
      timeout: 10,
      speechTimeout: 'auto',
      input: ['speech', 'dtmf'],
    },
  });
}

/**
 * Create AI response TwiML
 */
export function createAIResponse(
  message: string,
  language: string,
  continueUrl: string
): string {
  return createSpeechResponse(message, {
    language,
    gatherInput: {
      action: continueUrl,
      timeout: 8,
      speechTimeout: 'auto',
      input: ['speech', 'dtmf'],
    },
  });
}

/**
 * Create escalation to human TwiML
 */
export function createEscalationResponse(
  language: string,
  queueName?: string
): string {
  const response = new twiml.VoiceResponse();
  const voiceSettings = getVoiceSettings(language);
  
  const messages: Record<string, string> = {
    en: "I'm connecting you with a human support specialist. Please hold while we find the next available agent.",
    fr: "Je vous mets en contact avec un spécialiste du support humain. Veuillez patienter pendant que nous trouvons le prochain agent disponible.",
    de: "Ich verbinde Sie mit einem menschlichen Support-Spezialisten. Bitte warten Sie, während wir den nächsten verfügbaren Agenten finden.",
    it: "Ti sto collegando con uno specialista del supporto umano. Attendi mentre troviamo il prossimo agente disponibile.",
    zh: "我正在为您转接人工客服。请稍等，我们正在为您寻找下一位可用的客服。",
    fa: "من شما را به یک متخصص پشتیبانی انسانی متصل می‌کنم. لطفاً صبر کنید تا نماینده بعدی موجود را پیدا کنیم.",
  };
  
  response.say(
    { voice: voiceSettings.voice as 'Polly.Joanna' },
    messages[language] || messages.en
  );
  
  // Queue for human agent
  if (queueName) {
    response.enqueue({
      waitUrl: '/api/twilio/hold-music',
    }, queueName);
  } else {
    // Fallback to generic queue
    response.enqueue({
      waitUrl: '/api/twilio/hold-music',
    }, 'support');
  }
  
  return response.toString();
}

/**
 * Create hold music TwiML
 */
export function createHoldMusic(): string {
  const response = new twiml.VoiceResponse();
  
  response.say(
    { voice: 'Polly.Joanna' as const },
    "Thank you for holding. Your call is important to us. A support specialist will be with you shortly."
  );
  
  response.play({
    loop: 10,
  }, 'https://api.twilio.com/cowbell.mp3');
  
  return response.toString();
}

/**
 * Create goodbye message
 */
export function createGoodbye(language: string): string {
  const response = new twiml.VoiceResponse();
  const voiceSettings = getVoiceSettings(language);
  
  const messages: Record<string, string> = {
    en: "Thank you for contacting TechSupport AI. Goodbye!",
    fr: "Merci d'avoir contacté TechSupport AI. Au revoir!",
    de: "Vielen Dank, dass Sie TechSupport AI kontaktiert haben. Auf Wiedersehen!",
    it: "Grazie per aver contattato TechSupport AI. Arrivederci!",
    zh: "感谢您联系TechSupport AI。再见！",
    fa: "از تماس شما با TechSupport AI متشکریم. خداحافظ!",
  };
  
  response.say(
    { voice: voiceSettings.voice as 'Polly.Joanna' },
    messages[language] || messages.en
  );
  
  response.hangup();
  
  return response.toString();
}

/**
 * Create error response
 */
export function createErrorResponse(language: string): string {
  const response = new twiml.VoiceResponse();
  const voiceSettings = getVoiceSettings(language);
  
  const messages: Record<string, string> = {
    en: "I'm sorry, I encountered an error. Let me connect you with a human support specialist.",
    fr: "Je suis désolé, j'ai rencontré une erreur. Permettez-moi de vous mettre en contact avec un spécialiste du support humain.",
    de: "Es tut mir leid, ich bin auf einen Fehler gestoßen. Ich verbinde Sie mit einem menschlichen Support-Spezialisten.",
    it: "Mi dispiace, ho riscontrato un errore. Ti metto in contatto con uno specialista del supporto umano.",
    zh: "抱歉，我遇到了一个错误。让我为您转接人工客服。",
    fa: "متاسفم، با خطایی مواجه شدم. اجازه دهید شما را به یک متخصص پشتیبانی انسانی متصل کنم.",
  };
  
  response.say(
    { voice: voiceSettings.voice as 'Polly.Joanna' },
    messages[language] || messages.en
  );
  
  response.enqueue('support');
  
  return response.toString();
}
