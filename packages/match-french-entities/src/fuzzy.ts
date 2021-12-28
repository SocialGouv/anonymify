import {
  token_sort_ratio,
  // token_set_ratio,
  // token_similarity_sort_ratio,
  // WRatio,
  // ratio,
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
) => token_sort_ratio(query, choice.value, options);

const options = {
  scorer: customScorer,
  returnObjects: true,
  limit: 1,
  useCollator: true,
  trySimple: true,
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
  adjustedScore: number;
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

  return results
    .map((result) => ({
      type: result[0],
      score: result[1][0].score,
      adjustedScore:
        result[1][0].score * Math.max(0.005, result[1][0].choice.freq),
    }))
    .sort((res1: FuzzySearchResult, res2: FuzzySearchResult) => {
      return res2.adjustedScore - res1.adjustedScore;
    });
};
