export const cleanStr = (str: string) =>
  str &&
  str
    .trim()
    .toLowerCase()
    .replace(/[^\w\d]/, "");

export const cleanArr = (arr: string[]) => arr.map((v) => cleanStr(v));

export const removeStops = (arr: string[]): string[] => {
  const stops = ["le", "de", "la", "du", "d"];
  return arr.map((s) => s.toLowerCase()).filter((s) => stops.indexOf(s) === -1);
};
