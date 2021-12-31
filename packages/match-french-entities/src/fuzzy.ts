import MiniSearch from "minisearch";

import noms from "../data/noms.json";
import prenoms from "../data/prenoms.json";
import villes from "../data/villes.json";

type FuzzySearchResult = {
  type: string;
  score: number;
  initialScore: number;
};

type FuzzySearchResults = FuzzySearchResult[];

const rmAccents = (str: string) =>
  str
    .replace(/[éèêë]/g, "e")
    .replace(/[àâë]/g, "a")
    .replace(/[oêö]/g, "o");

const miniSearch = new MiniSearch({
  fields: ["value"],
  storeFields: ["type", "freq"],
  tokenize: (string, _fieldName) => {
    return [string];
  },
  processTerm: (term, _fieldName) =>
    rmAccents(term.replace(/[\s-]/g, "").toLowerCase()),
  searchOptions: {
    //boost: { title: 2 },
    prefix: true,
    fuzzy: 0.25,
    //  processTerm: (term) => term.replace(/[\s-]/g, "").toLowerCase(),
    tokenize: (string) => [string], //.split(/[\s-]+/), // search query tokenizer
  },
});

// Index all documents
miniSearch.addAll(prenoms.map((p, i) => ({ type: "prenom", id: i + 1, ...p })));
miniSearch.addAll(noms.map((p, i) => ({ type: "nom", id: i + 1, ...p })));
miniSearch.addAll(villes.map((p, i) => ({ type: "ville", id: i + 1, ...p })));

export const search = async (needle: string): Promise<FuzzySearchResults> => {
  const results = miniSearch.search(needle, {});

  return results
    .map((result) => ({
      type: result.type,
      initialScore: result.score,
      score:
        // this formula depends on input data.
        result.score * Math.min(0.1, Math.max(0.005, result.freq / 10)),
    }))
    .sort((res1: FuzzySearchResult, res2: FuzzySearchResult) => {
      return res2.score - res1.score;
    });
};
