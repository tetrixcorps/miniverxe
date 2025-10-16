import type { APIRoute } from 'astro';

interface PhoneValidation {
  isValid: boolean;
  formattedNumber: string;
  countryCode: string;
  nationalNumber: string;
  carrier?: string;
  lineType?: 'mobile' | 'landline' | 'voip' | 'unknown';
  validationSource: 'twilio' | 'libphonenumber' | 'manual';
}

export const POST: APIRoute = async ({ request }) => {
  const { phone, country = 'US' } = await request.json();

  if (!phone) {
    return new Response(JSON.stringify({ error: 'Phone number is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Basic phone number validation and formatting
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if phone number has minimum length
    if (cleaned.length < 10) {
      return new Response(JSON.stringify({
        isValid: false,
        formattedNumber: phone,
        countryCode: country,
        nationalNumber: phone,
        validationSource: 'manual'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic format validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return new Response(JSON.stringify({
        isValid: false,
        formattedNumber: phone,
        countryCode: country,
        nationalNumber: phone,
        validationSource: 'manual'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Format phone number based on country
    let formattedNumber = phone;
    let nationalNumber = cleaned;

    if (country === 'US' && cleaned.length === 10) {
      // Format as (XXX) XXX-XXXX
      formattedNumber = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      nationalNumber = `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US number with country code
      const withoutCountryCode = cleaned.slice(1);
      formattedNumber = `(${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
      nationalNumber = `+1${withoutCountryCode}`;
    }

    // Determine line type based on patterns (basic heuristic)
    let lineType: 'mobile' | 'landline' | 'voip' | 'unknown' = 'unknown';
    
    if (country === 'US') {
      const areaCode = cleaned.slice(0, 3);
      const exchange = cleaned.slice(3, 6);
      
      // Basic mobile number detection (not 100% accurate)
      if (['200', '201', '202', '203', '204', '205', '206', '207', '208', '209'].includes(areaCode) ||
          ['210', '212', '213', '214', '215', '216', '217', '218', '219', '220'].includes(areaCode)) {
        lineType = 'mobile';
      } else if (['800', '833', '844', '855', '866', '877', '888'].includes(areaCode)) {
        lineType = 'voip';
      } else {
        lineType = 'landline';
      }
    }

    // TODO: Integrate with Twilio Lookup API for more accurate validation
    // const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // try {
    //   const lookup = await twilioClient.lookups.v1.phoneNumbers(nationalNumber).fetch();
    //   return res.status(200).json({
    //     isValid: true,
    //     formattedNumber: lookup.phoneNumber,
    //     countryCode: lookup.countryCode,
    //     nationalNumber: lookup.nationalFormat,
    //     carrier: lookup.carrier?.name,
    //     lineType: lookup.carrier?.type || 'unknown',
    //     validationSource: 'twilio'
    //   });
    // } catch (twilioError) {
    //   // Fall back to basic validation
    // }

    return new Response(JSON.stringify({
      isValid: true,
      formattedNumber,
      countryCode: country,
      nationalNumber,
      lineType,
      validationSource: 'libphonenumber'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Phone validation error:', error);
    return new Response(JSON.stringify({ error: 'Phone validation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
