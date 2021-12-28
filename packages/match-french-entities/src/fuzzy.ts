import {
  token_sort_ratio,
  ratio,
  extractAsPromised,
  FuzzballBaseOptions,
} from "fuzzball";

import noms from "../data/noms.json";
import prenoms from "../data/prenoms.json";
import villes from "../data/villes.json";

const customScorer = (
  query: string,
  choice: CorpusDataEntry,
  options: Record<string, string>
) => ratio(query, choice.value, options);

const options = {
  scorer: customScorer,
  returnObjects: true,
  limit: 1,
  useCollator: true,
  //trySimple: true,
  //force_ascii: true,
} as FuzzballBaseOptions;

type Result = [string, ResultRow];

type ResultRow = [{ score: number; choice: CorpusDataEntry }];

type Results = Result[];

type CorpusDataEntry = { value: string; freq: number };
type CorpusData = CorpusDataEntry[];

type FuzzySearchResult = {
  type: string;
  score: number;
};

type FuzzySearchResults = FuzzySearchResult[];

const corpus = {
  nom: noms,
  prenom: prenoms,
  ville: villes,
} as Record<string, CorpusData>;

export const search = async (needle: string): Promise<FuzzySearchResults> => {
  const results = (await Promise.all(
    Object.keys(corpus).map(async (key) => [
      key,
      await extractAsPromised(needle, corpus[key], options),
    ])
  )) as unknown as Results;

  console.log("search", needle, results);

  // favorize token_sort_ratio over term frequency to sort results
  results.sort((res1: Result, res2: Result) => {
    return (
      res2[1][0].score -
      res1[1][0].score +
      (res2[1][0].choice.freq - res1[1][0].choice.freq) / 10
    );
  });

  return results.map((result) => ({
    type: result[0],
    score: result[1][0].score,
  }));
};
