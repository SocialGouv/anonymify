import {
  token_sort_ratio,
  extractAsPromised,
  FuzzballAsyncExtractOptions,
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

const corpus = {
  nom: noms,
  prenom: prenoms,
  ville: villes,
} as Record<string, CorpusData>;

export const search = async (needle: string): Promise<FuzzySearchResult> => {
  const results = (await Promise.all(
    Object.keys(corpus).map(async (key) => [
      key,
      await extractAsPromised(needle, corpus[key], options),
    ])
  )) as unknown as Results;

  // favorize token_sort_ratio over term frequency to sort results
  results.sort((res1: Result, res2: Result) => {
    return (
      res2[1][0].score -
      res1[1][0].score +
      (res2[1][0].choice.freq - res1[1][0].choice.freq) / 10
    );
  });

  const bestResult = results[0];

  return {
    type: bestResult[0],
    score: bestResult[1][0].score,
  };
};

// const searches = [
//   "Julien",
//   "Martin",
//   "Céline",
//   "Celine",
//   "CELINE",
//   "mont de marsan",
//   "momo",
//   "Larbi",
//   "Leila",
//   "Gus",
//   "Henri de la tour",
//   "de la verriere",
//   "Emmanuel",
//   "Catherine",
//   "CATHERINE",
//   "Pinard",
//   "Pinardo",
//   "bouquillon",
//   "saint etienne",
//   "sens",
//   "pedro",
//   "maalik",
//   "anderson",
//   "Rochefourchat",
//   "Ornes",
//   "villeneuve saint georges",
//   "saint-clement",
// ];

// searches.forEach((query) => {
//   search(query).then(({ type, score }) => {
//     console.log(query, type, score);
//   });
// });
