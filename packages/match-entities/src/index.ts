import { search as fuzzySearch } from "./fuzzy";
import { match as regexMatch } from "./regexps";
//@ts-expect-error
import ngraminator from "ngraminator";

import untypedConfig from "../config.json";

import { cleanArr, cleanStr } from "./utils";

import { AnonymifyConfig, MatchSearchResults, MatchEntity } from "../index.d";

export type {
  AnonymifyConfig,
  MatchSearchResults,
  MatchEntity,
} from "../index.d";

const config = <AnonymifyConfig>untypedConfig;

//export type AnonymifyConfig;
//export  MatchSearchResults;
//export  MatchEntit;

export const match = async (needle: string): Promise<MatchSearchResults> => {
  if (!needle.trim().length) return [];

  // first use config matchers
  const matches = Object.keys(config.matchers)
    .filter(
      (key) =>
        "regexps" in config.matchers[key as MatchEntity] ||
        "items" in config.matchers[key as MatchEntity]
    )
    .map((key) => {
      const matcher = config.matchers[key as MatchEntity];
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
