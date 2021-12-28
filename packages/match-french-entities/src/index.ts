import { search as fuzzySearch } from "./fuzzy";

type SearchResult = {
  type: string;
  score: number;
};

type SearchResults = SearchResult[];

export const search = async (needle: string): Promise<SearchResults> => {
  return fuzzySearch(needle);
};
