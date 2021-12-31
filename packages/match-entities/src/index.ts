import { search as fuzzySearch } from "./fuzzy";
import { match as regexMatch } from "./regexps";
//@ts-expect-error
import ngraminator from "ngraminator";

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

const removeStops = (arr: string[]): string[] => {
  const stops = ["le", "de", "la", "du", "d"];
  return arr.map((s) => s.toLowerCase()).filter((s) => stops.indexOf(s) === -1);
};

export const match = async (needle: string): Promise<SearchResults> => {
  if (!needle.trim().length) return [];
  const matches = Object.keys(config.matchers)
    .map((key) => {
      //@ts-expect-error
      const matcher = config.matchers[key] as Matcher;
      if ("regexps" in matcher && regexMatch(needle, matcher.regexps)) {
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

  if (needle.length > 30) {
    matches.push({ type: "text", score: 100 });
  }

  if (!matches.length && needle.length > 3) {
    matches.push(...(await fuzzySearch(needle)));
  }

  if (!matches.length && needle.indexOf(" ") > -1) {
    // search nom + prenom
    const ngrams = ngraminator(needle.split(" "), [1, 2, 3, 4])
      .map((item: string[]) => item.join(" "))
      .filter((s: string) => s.length > 3);

    const ngramResults = (
      await Promise.all(ngrams.map((ngram: string) => fuzzySearch(ngram)))
    )
      .slice(0, 10)
      .flatMap((result: any) => result && result.length && result.slice(0, 5))
      .filter((result: any) => result.score > 0.2) // keep most relevant matches
      .map((result: any) => result.type)
      .filter(Boolean);

    if (
      ngramResults.indexOf("nom") > -1 &&
      ngramResults.indexOf("prenom") > -1
    ) {
      matches.push({ type: "fullname", score: 100 });
    }
  }

  if (!matches.length && !Number(needle)) {
    matches.push({ type: "text", score: 100 });
  }

  return matches as SearchResults;
};
