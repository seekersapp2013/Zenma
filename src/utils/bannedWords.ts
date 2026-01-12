// Utility function to filter banned words from text
export function filterBannedWords(text: string, bannedWords: string[]): string {
  if (!text || bannedWords.length === 0) {
    return text;
  }

  let filteredText = text;
  
  bannedWords.forEach(word => {
    // Create regex to match the word (case insensitive, whole word)
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    // Replace with asterisks of the same length
    filteredText = filteredText.replace(regex, (match) => '*'.repeat(match.length));
  });

  return filteredText;
}

// Hook to get filtered text
export function useFilteredText(text: string, bannedWords: string[]): string {
  return filterBannedWords(text, bannedWords);
}