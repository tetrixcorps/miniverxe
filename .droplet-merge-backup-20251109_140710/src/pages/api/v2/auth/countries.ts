import type { APIRoute } from 'astro';

// Get supported countries for phone formatting
export const GET: APIRoute = async () => {
  try {
    const countries = [
      { code: '+1', name: 'United States', countryCode: 'US' },
      { code: '+1', name: 'Canada', countryCode: 'CA' },
      { code: '+44', name: 'United Kingdom', countryCode: 'GB' },
      { code: '+61', name: 'Australia', countryCode: 'AU' },
      { code: '+64', name: 'New Zealand', countryCode: 'NZ' },
      { code: '+27', name: 'South Africa', countryCode: 'ZA' },
      { code: '+971', name: 'United Arab Emirates', countryCode: 'AE' },
      { code: '+966', name: 'Saudi Arabia', countryCode: 'SA' },
      { code: '+33', name: 'France', countryCode: 'FR' },
      { code: '+49', name: 'Germany', countryCode: 'DE' },
      { code: '+39', name: 'Italy', countryCode: 'IT' },
      { code: '+34', name: 'Spain', countryCode: 'ES' },
      { code: '+31', name: 'Netherlands', countryCode: 'NL' },
      { code: '+32', name: 'Belgium', countryCode: 'BE' },
      { code: '+41', name: 'Switzerland', countryCode: 'CH' },
      { code: '+43', name: 'Austria', countryCode: 'AT' },
      { code: '+45', name: 'Denmark', countryCode: 'DK' },
      { code: '+46', name: 'Sweden', countryCode: 'SE' },
      { code: '+47', name: 'Norway', countryCode: 'NO' },
      { code: '+358', name: 'Finland', countryCode: 'FI' },
      { code: '+48', name: 'Poland', countryCode: 'PL' },
      { code: '+353', name: 'Ireland', countryCode: 'IE' },
      { code: '+351', name: 'Portugal', countryCode: 'PT' },
      { code: '+30', name: 'Greece', countryCode: 'GR' },
      { code: '+90', name: 'Turkey', countryCode: 'TR' },
      { code: '+7', name: 'Russia', countryCode: 'RU' },
      { code: '+380', name: 'Ukraine', countryCode: 'UA' },
      { code: '+86', name: 'China', countryCode: 'CN' },
      { code: '+81', name: 'Japan', countryCode: 'JP' },
      { code: '+82', name: 'South Korea', countryCode: 'KR' },
      { code: '+886', name: 'Taiwan', countryCode: 'TW' },
      { code: '+852', name: 'Hong Kong', countryCode: 'HK' },
      { code: '+65', name: 'Singapore', countryCode: 'SG' },
      { code: '+60', name: 'Malaysia', countryCode: 'MY' },
      { code: '+66', name: 'Thailand', countryCode: 'TH' },
      { code: '+62', name: 'Indonesia', countryCode: 'ID' },
      { code: '+63', name: 'Philippines', countryCode: 'PH' },
      { code: '+84', name: 'Vietnam', countryCode: 'VN' },
      { code: '+91', name: 'India', countryCode: 'IN' },
      { code: '+92', name: 'Pakistan', countryCode: 'PK' },
      { code: '+880', name: 'Bangladesh', countryCode: 'BD' },
      { code: '+52', name: 'Mexico', countryCode: 'MX' },
      { code: '+55', name: 'Brazil', countryCode: 'BR' },
      { code: '+54', name: 'Argentina', countryCode: 'AR' },
      { code: '+56', name: 'Chile', countryCode: 'CL' },
      { code: '+57', name: 'Colombia', countryCode: 'CO' },
      { code: '+51', name: 'Peru', countryCode: 'PE' },
      { code: '+58', name: 'Venezuela', countryCode: 'VE' },
      { code: '+593', name: 'Ecuador', countryCode: 'EC' },
      { code: '+598', name: 'Uruguay', countryCode: 'UY' },
      { code: '+595', name: 'Paraguay', countryCode: 'PY' },
      { code: '+591', name: 'Bolivia', countryCode: 'BO' },
      { code: '+506', name: 'Costa Rica', countryCode: 'CR' },
      { code: '+507', name: 'Panama', countryCode: 'PA' },
      { code: '+502', name: 'Guatemala', countryCode: 'GT' },
      { code: '+504', name: 'Honduras', countryCode: 'HN' },
      { code: '+503', name: 'El Salvador', countryCode: 'SV' },
      { code: '+505', name: 'Nicaragua', countryCode: 'NI' },
      { code: '+1', name: 'Dominican Republic', countryCode: 'DO' },
      { code: '+53', name: 'Cuba', countryCode: 'CU' },
      { code: '+234', name: 'Nigeria', countryCode: 'NG' },
      { code: '+254', name: 'Kenya', countryCode: 'KE' },
      { code: '+233', name: 'Ghana', countryCode: 'GH' },
      { code: '+972', name: 'Israel', countryCode: 'IL' }
    ];

    return new Response(JSON.stringify({
      success: true,
      countries: countries,
      total: countries.length,
      message: `Supported countries for phone verification. Showing ${countries.length} most common.`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Countries fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Countries fetch failed',
      message: 'An error occurred while fetching supported countries'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

