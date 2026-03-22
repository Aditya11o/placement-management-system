/**
 * Utility to validate email domains based on system roles
 */

const PUBLIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  'gmx.com',
  'yandex.com',
  'live.com',
  'msn.com'
];

const INSTITUTIONAL_DOMAIN = 'tnu.in';

/**
 * Validates if the email domain is allowed for the given role
 * @param {string} email 
 * @param {string} role 
 * @returns {Object} { isValid: boolean, message: string }
 */
const validateEmailDomain = (email, role) => {
  if (!email || !email.includes('@')) {
    return { isValid: false, message: 'Invalid email format' };
  }

  const domain = email.split('@')[1].toLowerCase();

  if (role === 'student' || role === 'admin') {
    if (domain !== INSTITUTIONAL_DOMAIN) {
      return { 
        isValid: false, 
        message: 'Use your institutional email (@tnu.in only)' 
      };
    }
  }

  if (role === 'recruiter') {
    if (PUBLIC_DOMAINS.includes(domain)) {
      return { 
        isValid: false, 
        message: 'Use your company official email (public domains like Gmail/Yahoo are not allowed)' 
      };
    }
  }

  return { isValid: true, message: 'Domain is valid' };
};

module.exports = { validateEmailDomain, PUBLIC_DOMAINS, INSTITUTIONAL_DOMAIN };
