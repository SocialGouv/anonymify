import {
  token_sort_ratio,
  distance,
  token_set_ratio,
  token_similarity_sort_ratio,
  partial_token_sort_ratio,
  WRatio,
  process_and_sort,
  full_process,
  ratio,
  extractAsPromised,
  FuzzballBaseOptions,
} from "fuzzball";

import noms from "../data/noms.json";
import prenoms from "../data/prenoms.json";
import villes from "../data/villes.json";

const processCorpus = (corpus: CorpusData) => {
  for (const choice of corpus) {
    choice.proc_sorted = process_and_sort(
      full_process(choice.value, { force_ascii: true })
    );
  }
  return corpus;
};

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
  full_process: false,
} as FuzzballBaseOptions;

type Result = [string, ResultRow];

type ResultRow = [{ score: number; choice: CorpusDataEntry }];

type Results = Result[];

type CorpusDataEntry = { value: string; freq: number; proc_sorted?: any };
type CorpusData = CorpusDataEntry[];

type FuzzySearchResult = {
  type: string;
  score: number;
  adjustedScore: number;
};

type FuzzySearchResults = FuzzySearchResult[];

const corpus = {
  nom: processCorpus(noms),
  prenom: processCorpus(prenoms),
  ville: processCorpus(villes),
} as Record<string, CorpusData>;

export const search = async (needle: string): Promise<FuzzySearchResults> => {
  const results = (await Promise.all(
    Object.keys(corpus).map(async (key) => [
      key,
      await extractAsPromised(
        full_process(needle, { force_ascii: true }),
        corpus[key],
        options
      ),
    ])
  )) as unknown as Results;

  const sortedResults = results
    .map((result) => ({
      type: result[0],
      score: result[1][0].score,
      adjustedScore:
        // this formula depends on input data.
        result[1][0].score *
        Math.min(0.008, Math.max(0.005, result[1][0].choice.freq / 10)),
    }))
    .sort((res1: FuzzySearchResult, res2: FuzzySearchResult) => {
      return res2.adjustedScore - res1.adjustedScore;
    });

  return sortedResults;
};
