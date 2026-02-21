export interface SavedDraft<T> {
  data: T;
  savedAt: string; // ISO string
}

export const saveDraft = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    const draft: SavedDraft<T> = {
      data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (error) {
    console.error(`Failed to save draft to localStorage for key: ${key}`, error);
  }
};

export const getDraft = <T>(key: string): SavedDraft<T> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as SavedDraft<T>;
  } catch (error) {
    console.error(`Failed to retrieve draft from localStorage for key: ${key}`, error);
    return null;
  }
};

export const removeDraft = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove draft from localStorage for key: ${key}`, error);
  }
};
