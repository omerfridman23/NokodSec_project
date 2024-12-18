export const toTitleCase = (str: string): string =>
  str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
