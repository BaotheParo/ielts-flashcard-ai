export const saveApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ielts_w1_api_key', key);
  }
};

export const getApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ielts_w1_api_key');
  }
  return null;
};

export const clearProgress = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ielts_w1_storage');
  }
};
