import { search as fuzzySearch } from "./fuzzy";
import { match as regexMatch } from "./regexps";
//@ts-expect-error
import ngraminator from "ngraminator";

import {
  Entity,
  AnonymifyConfig,
  MatchSearchResults,
  Matcher,
} from "./index.d";

import untypedConfig from "../config.json";

const config = <AnonymifyConfig>untypedConfig;

import { cleanArr, cleanStr } from "./utils";

export const match = async (needle: string): Promise<MatchSearchResults> => {
  if (!needle.trim().length) return [];

  // first use config matchers
  const matches = Object.keys(config.matchers)
    .filter(
      (key) =>
        "regexps" in config.matchers[key as Entity] ||
        "items" in config.matchers[key as Entity]
    )
    .map((key) => {
      const matcher = config.matchers[key as Entity] as Matcher;
      if ("regexps" in matcher && regexMatch(needle, matcher.regexps)) {
        return { type: key, score: 100 };
      } else if (
        "items" in matcher &&
        matcher.items &&
        matcher.items.length &&
        cleanArr(matcher.items).indexOf(cleanStr(needle)) > -1
      ) {
        return { type: key, score: 100 };
      }
    })
    .filter(Boolean);

  // exclude long text
  if (needle.length > 30) {
    matches.push({ type: "text", score: 100 });
  }

  // try fuzzy search
  if (!matches.length && needle.length > 3) {
    matches.push(...(await fuzzySearch(needle)));
  }

  // try fuzzy + tokenisation
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
      ngramResults.indexOf("firstname") > -1 &&
      ngramResults.indexOf("lastname") > -1
    ) {
      matches.push({ type: "fullname", score: 100 });
    }
  }

  // default to text
  if (!matches.length && !Number(needle)) {
    matches.push({ type: "text", score: 100 });
  }

  return matches as MatchSearchResults;
};
