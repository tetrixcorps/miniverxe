// Enhanced TeXML Voice API Endpoint
// Advanced voice applications with industry-specific features

import type { APIRoute } from 'astro';

// Industry-specific TeXML response generators
export class TeXMLResponseGenerator {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
  }

  // Enhanced greeting with industry detection
  generateIndustryGreeting(industry?: string): string {
    const industryGreetings = {
      healthcare: `Welcome to TETRIX Healthcare Solutions. For patient inquiries, press 1. For provider support, press 2. For billing questions, press 3. For emergency assistance, press 0.`,
      legal: `Welcome to TETRIX Legal Services. For client services, press 1. For attorney support, press 2. For case management, press 3. For urgent legal matters, press 0.`,
      fleet: `Welcome to TETRIX Fleet Management. For driver support, press 1. For vehicle tracking, press 2. For maintenance alerts, press 3. For emergency dispatch, press 0.`,
      general: `Welcome to TETRIX Enterprise Solutions. For sales inquiries, press 1. For technical support, press 2. For billing questions, press 3. For operator assistance, press 0.`
    };

    const greeting = industryGreetings[industry as keyof typeof industryGreetings] || industryGreetings.general;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${greeting}</Say>
  <Gather input="speech dtmf" numDigits="1" timeout="15" action="${this.webhookUrl}/api/voice/texml-enhanced" method="POST">
    <Say voice="alice">Please speak your selection or press a number on your keypad.</Say>
  </Gather>
  <Say voice="alice">We didn't receive any input. Please call back later. Goodbye.</Say>
  <Hangup/>
</Response>`;
  }

  // Multi-language support
  generateMultiLanguageGreeting(language: string = 'en-US'): string {
    const languageGreetings = {
      'en-US': 'Welcome to TETRIX Enterprise Solutions. How may I assist you today?',
      'es-ES': 'Bienvenido a TETRIX Soluciones Empresariales. ¿Cómo puedo ayudarle hoy?',
      'fr-FR': 'Bienvenue chez TETRIX Solutions d\'Entreprise. Comment puis-je vous aider aujourd\'hui?',
      'de-DE': 'Willkommen bei TETRIX Unternehmenslösungen. Wie kann ich Ihnen heute helfen?',
      'pt-BR': 'Bem-vindo às Soluções Empresariais TETRIX. Como posso ajudá-lo hoje?'
    };

    const greeting = languageGreetings[language as keyof typeof languageGreetings] || languageGreetings['en-US'];

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${language}">${greeting}</Say>
  <Gather input="speech dtmf" numDigits="1" timeout="15" action="${this.webhookUrl}/api/voice/texml-enhanced" method="POST">
    <Say voice="alice" language="${language}">Please speak your selection or press a number.</Say>
  </Gather>
  <Say voice="alice" language="${language}">We didn't receive any input. Please call back later. Goodbye.</Say>
  <Hangup/>
</Response>`;
  }

  // Healthcare-specific routing
  generateHealthcareRouting(dtmf: string): string {
    const routing = {
      '1': {
        message: 'Connecting you to our patient services team. Please hold while we verify your information.',
        number: '+1-800-596-3057',
        recording: 'record-from-answer',
        compliance: 'hipaa'
      },
      '2': {
        message: 'You have reached our provider support team. Please hold while we connect you to a healthcare specialist.',
        number: '+1-888-804-6762',
        recording: 'record-from-answer',
        compliance: 'hipaa'
      },
      '3': {
        message: 'You have reached our billing department. Please hold while we connect you to a billing specialist.',
        number: '+1-888-804-6762',
        recording: 'record-from-answer',
        compliance: 'hipaa'
      },
      '0': {
        message: 'You have reached our emergency assistance line. Please hold while we connect you to an emergency coordinator.',
        number: '+1-800-596-3057',
        recording: 'record-from-answer',
        compliance: 'hipaa'
      }
    };

    const route = routing[dtmf as keyof typeof routing];
    if (!route) {
      return this.generateInvalidSelection();
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${route.message}</Say>
  <Dial timeout="30" record="${route.recording}" recordingStatusCallback="${this.webhookUrl}/api/voice/recording-status">
    <Number>${route.number}</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later or contact us through our patient portal.</Say>
  <Hangup/>
</Response>`;
  }

  // Legal-specific routing with privilege protection
  generateLegalRouting(dtmf: string): string {
    const routing = {
      '1': {
        message: 'You are now connected to TETRIX Legal Services. This call is protected by attorney-client privilege. Please hold while we connect you to a legal specialist.',
        number: '+1-800-596-3057',
        recording: 'record-from-answer',
        compliance: 'attorney_client_privilege'
      },
      '2': {
        message: 'You have reached our attorney support team. This call is protected by attorney-client privilege. Please hold while we connect you to an attorney.',
        number: '+1-888-804-6762',
        recording: 'record-from-answer',
        compliance: 'attorney_client_privilege'
      },
      '3': {
        message: 'You have reached our case management department. This call is protected by attorney-client privilege. Please hold while we connect you to a case manager.',
        number: '+1-888-804-6762',
        recording: 'record-from-answer',
        compliance: 'attorney_client_privilege'
      },
      '0': {
        message: 'You have reached our urgent legal matters line. This call is protected by attorney-client privilege. Please hold while we connect you to an emergency attorney.',
        number: '+1-800-596-3057',
        recording: 'record-from-answer',
        compliance: 'attorney_client_privilege'
      }
    };

    const route = routing[dtmf as keyof typeof routing];
    if (!route) {
      return this.generateInvalidSelection();
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${route.message}</Say>
  <Dial timeout="30" record="${route.recording}" recordingStatusCallback="${this.webhookUrl}/api/voice/recording-status">
    <Number>${route.number}</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later or contact us through our secure legal portal.</Say>
  <Hangup/>
</Response>`;
  }

  // Fleet management routing
  generateFleetRouting(dtmf: string): string {
    const routing = {
      '1': {
        message: 'You have reached TETRIX Fleet Management driver support. Please hold while we connect you to a fleet coordinator.',
        number: '+1-800-596-3057',
        recording: 'record-from-answer',
        compliance: 'fleet_management'
      },
      '2': {
        message: 'You have reached our vehicle tracking department. Please hold while we connect you to a tracking specialist.',
        number: '+1-888-804-6762',
        recording: 'record-from-answer',
        compliance: 'fleet_management'
      },
      '3': {
        message: 'You have reached our maintenance alerts department. Please hold while we connect you to a maintenance coordinator.',
        number: '+1-888-804-6762',
        recording: 'record-from-answer',
        compliance: 'fleet_management'
      },
      '0': {
        message: 'You have reached our emergency dispatch line. Please hold while we connect you to an emergency coordinator.',
        number: '+1-800-596-3057',
        recording: 'record-from-answer',
        compliance: 'fleet_management'
      }
    };

    const route = routing[dtmf as keyof typeof routing];
    if (!route) {
      return this.generateInvalidSelection();
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${route.message}</Say>
  <Dial timeout="30" record="${route.recording}" recordingStatusCallback="${this.webhookUrl}/api/voice/recording-status">
    <Number>${route.number}</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later or use our fleet management app for immediate assistance.</Say>
  <Hangup/>
</Response>`;
  }

  // Conference calling for enterprise
  generateConferenceCall(conferenceId: string, participantName?: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to the TETRIX Enterprise conference room. ${participantName ? `You are joining as ${participantName}.` : ''} Please wait while we connect you to the conference.</Say>
  <Conference 
    name="tetrix-enterprise-${conferenceId}" 
    maxParticipants="50" 
    record="record-from-start"
    startConferenceOnEnter="true"
    endConferenceOnExit="false"
    recordingStatusCallback="${this.webhookUrl}/api/voice/conference-recording-status"
    statusCallback="${this.webhookUrl}/api/voice/conference-status">
    <Say voice="alice">You are now in the TETRIX Enterprise conference room. Please introduce yourself when ready.</Say>
  </Conference>
</Response>`;
  }

  // Voicemail with transcription
  generateVoicemailBox(mailboxId: string, greeting?: string): string {
    const defaultGreeting = greeting || 'You have reached the TETRIX voicemail system. Please leave your message after the beep.';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${defaultGreeting}</Say>
  <Record 
    timeout="30" 
    maxLength="300" 
    playBeep="true"
    recordingStatusCallback="${this.webhookUrl}/api/voice/voicemail-status"
    transcribe="true"
    transcribeCallback="${this.webhookUrl}/api/voice/voicemail-transcription">
  </Record>
  <Say voice="alice">Thank you for your message. Goodbye.</Say>
  <Hangup/>
</Response>`;
  }

  // Advanced call recording with compliance
  generateCompliantRecording(complianceType: string): string {
    const complianceMessages = {
      hipaa: 'This call may be recorded for quality assurance and medical record purposes. By continuing, you consent to the recording.',
      attorney_client_privilege: 'This call is protected by attorney-client privilege and may be recorded for legal purposes.',
      general: 'This call may be recorded for quality assurance and training purposes.'
    };

    const message = complianceMessages[complianceType as keyof typeof complianceMessages] || complianceMessages.general;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
  <Record 
    timeout="300" 
    maxLength="1800" 
    playBeep="true"
    recordingStatusCallback="${this.webhookUrl}/api/voice/recording-status"
    transcribe="true"
    transcribeCallback="${this.webhookUrl}/api/voice/transcription-status">
  </Record>
  <Say voice="alice">Thank you for your call. Goodbye.</Say>
  <Hangup/>
</Response>`;
  }

  // Time-based routing
  generateTimeBasedRouting(): string {
    const currentHour = new Date().getHours();
    const isBusinessHours = currentHour >= 9 && currentHour <= 17;
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

    if (isWeekend) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling TETRIX. Our offices are closed on weekends. For urgent matters, please press 0 to speak with our emergency line. For non-urgent inquiries, please leave a message after the beep.</Say>
  <Gather numDigits="1" timeout="10" action="${this.webhookUrl}/api/voice/texml-enhanced" method="POST">
    <Say voice="alice">Press 0 for emergency assistance or wait to leave a message.</Say>
  </Gather>
  <Record timeout="60" maxLength="300" playBeep="true">
    <Say voice="alice">Please leave your message after the beep.</Say>
  </Record>
  <Say voice="alice">Thank you for your message. We will return your call on the next business day.</Say>
  <Hangup/>
</Response>`;
    }

    if (!isBusinessHours) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling TETRIX. Our offices are currently closed. Our business hours are Monday through Friday, 9 AM to 5 PM. For urgent matters, please press 0 to speak with our emergency line.</Say>
  <Gather numDigits="1" timeout="10" action="${this.webhookUrl}/api/voice/texml-enhanced" method="POST">
    <Say voice="alice">Press 0 for emergency assistance or wait to leave a message.</Say>
  </Gather>
  <Record timeout="60" maxLength="300" playBeep="true">
    <Say voice="alice">Please leave your message after the beep.</Say>
  </Record>
  <Say voice="alice">Thank you for your message. We will return your call during business hours.</Say>
  <Hangup/>
</Response>`;
    }

    return this.generateIndustryGreeting();
  }

  // Invalid selection handler
  generateInvalidSelection(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Invalid selection. Please try again.</Say>
  <Redirect>${this.webhookUrl}/api/voice/texml-enhanced</Redirect>
</Response>`;
  }

  // Hangup handler
  generateHangup(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
  }
}

// Main TeXML handler
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json();
    const { event_type, data, industry, language, conferenceId, mailboxId, complianceType } = body;
    
    console.log('Enhanced TeXML webhook received:', {
      event_type,
      industry,
      language,
      conferenceId,
      mailboxId,
      complianceType,
      call_control_id: data?.call_control_id,
      from: data?.from,
      to: data?.to,
      timestamp: new Date().toISOString()
    });

    const generator = new TeXMLResponseGenerator();
    let twiMLResponse = '';

    // Handle different event types with enhanced features
    switch (event_type) {
      case 'call.initiated':
      case 'call.answered':
        // Industry-specific or time-based routing
        if (industry) {
          twiMLResponse = generator.generateIndustryGreeting(industry);
        } else if (language) {
          twiMLResponse = generator.generateMultiLanguageGreeting(language);
        } else {
          twiMLResponse = generator.generateTimeBasedRouting();
        }
        break;

      case 'call.gather.ended':
        // Handle DTMF input with industry-specific routing
        const dtmf = data?.digits || data?.dtmf;
        if (dtmf) {
          switch (industry) {
            case 'healthcare':
              twiMLResponse = generator.generateHealthcareRouting(dtmf);
              break;
            case 'legal':
              twiMLResponse = generator.generateLegalRouting(dtmf);
              break;
            case 'fleet':
              twiMLResponse = generator.generateFleetRouting(dtmf);
              break;
            default:
              // Fallback to general routing
              twiMLResponse = generator.generateIndustryGreeting();
          }
        } else {
          twiMLResponse = generator.generateIndustryGreeting(industry);
        }
        break;

      case 'conference.start':
        twiMLResponse = generator.generateConferenceCall(conferenceId || 'default');
        break;

      case 'voicemail.start':
        twiMLResponse = generator.generateVoicemailBox(mailboxId || 'default');
        break;

      case 'recording.start':
        twiMLResponse = generator.generateCompliantRecording(complianceType || 'general');
        break;

      case 'call.hangup':
        twiMLResponse = generator.generateHangup();
        break;

      default:
        console.log('Unhandled enhanced TeXML event:', event_type);
        twiMLResponse = generator.generateTimeBasedRouting();
    }

    return new Response(twiMLResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-TETRIX-Industry': industry || 'general',
        'X-TETRIX-Language': language || 'en-US',
        'X-TETRIX-Compliance': complianceType || 'general'
      }
    });

  } catch (error) {
    console.error('Enhanced TeXML processing failed:', error);
    
    // Always return TeXML for voice webhooks
    const errorTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;
    
    return new Response(errorTwiML, {
      status: 200, // Return 200 to avoid Telnyx retries
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};
