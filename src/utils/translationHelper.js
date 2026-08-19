export const getLanguageCode = (langName) => {
  const langMap = {
    'English (US) - Primary': 'en',
    'English (US)': 'en',
    'Spanish (ES)': 'es',
    'French (FR)': 'fr',
    'German (DE)': 'de',
    'Hindi (HI)': 'hi'
  };
  return langMap[langName] || 'en';
};

export const applyTranslation = (langName) => {
  const code = getLanguageCode(langName);
  const cookieName = 'googtrans';
  
  if (code === 'en') {
    // Delete cookie to restore default English
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  } else {
    // Set cookie for targeted language
    const cookieValue = `/en/${code}`;
    document.cookie = `${cookieName}=${cookieValue}; path=/;`;
    document.cookie = `${cookieName}=${cookieValue}; path=/; domain=${window.location.hostname};`;
  }
};
