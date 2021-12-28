import { search as fuzzySearch } from "./fuzzy";
import { match as regexMatch } from "./regexps";

import config from "../config.json";

type SearchResult = {
  type: string;
  score: number;
};

type SearchResults = SearchResult[];

type CorpusMatcher = {
  url?: string;
  items?: string[];
};

type RegexpsMatcher = {
  regexps: string[];
};

type Matcher = CorpusMatcher | RegexpsMatcher;

interface Config {
  matchers: {
    [key: string]: Matcher;
  };
}

const cleanStr = (str: string) =>
  str &&
  str
    .trim()
    .toLowerCase()
    .replace(/[^\w\d]/, "");

const cleanArr = (arr: string[]) => arr.map((v) => cleanStr(v));

export const match = async (needle: string): Promise<SearchResults> => {
  if (!needle.trim().length) return [];
  const matches = Object.keys(config.matchers)
    // .filter(key)
    .map((key) => {
      //@ts-expect-error
      const matcher = config.matchers[key] as Matcher;
      //@ts-expect-error
      if (matcher.regexps && regexMatch(needle, matcher.regexps)) {
        return { type: key, score: 100 };
      } else if (
        //@ts-expect-error
        matcher.items &&
        //@ts-expect-error
        cleanArr(matcher.items).indexOf(cleanStr(needle)) > -1
      ) {
        return { type: key, score: 100 };
      }
    })
    .filter(Boolean);

  if (Number(needle.replace(/,/, "."))) {
    matches.push({ type: "number", score: 100 });
  }

  if (needle.length > 50) {
    matches.push({ type: "text", score: 100 });
  }

  if (!matches.length) {
    matches.push(...(await fuzzySearch(needle)));
  }

  if (!matches.length && !Number(needle)) {
    matches.push({ type: "text", score: 100 });
  }

  return matches as SearchResults;
};
