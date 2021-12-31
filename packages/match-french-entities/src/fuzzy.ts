import fuzzball from "fuzzball";
import pAll from "p-all";
import noms from "../data/noms.json";
import prenoms from "../data/prenoms.json";
import villes from "../data/villes.json";

const processCorpus = (corpus: CorpusData) => {
  for (const choice of corpus) {
    choice.proc_sorted = fuzzball.process_and_sort(
      fuzzball.full_process(choice.value, { force_ascii: true })
    );
  }
  return corpus;
};

const customScorer = (
  query: string,
  choice: CorpusDataEntry,
  options: Record<string, string>
) => fuzzball.ratio(query, choice.value, options);

const options = {
  scorer: customScorer,
  returnObjects: true,
  limit: 1,
  useCollator: true,
  full_process: false,
  cutoff: 75, // suppress low results
} as fuzzball.FuzzballBaseOptions;

type Result = [string, ResultRow];

type ResultRow = [{ score: number; choice: CorpusDataEntry }];

type Results = Result[];

type CorpusDataEntry = { value: string; freq: number; proc_sorted?: any };
type CorpusData = CorpusDataEntry[];

type FuzzySearchResult = {
  type: string;
  score: number;
  initialScore: number;
};

type FuzzySearchResults = FuzzySearchResult[];

const corpus = {
  nom: processCorpus(noms),
  prenom: processCorpus(prenoms),
  ville: processCorpus(villes),
} as Record<string, CorpusData>;

export const search = async (needle: string): Promise<FuzzySearchResults> => {
  const cleanNeedle = fuzzball.full_process(needle, { force_ascii: true });
  const results = (await pAll(
    Object.keys(corpus).map((key) => async () => {
      console.time(needle + "." + key);
      return [
        key,
        await fuzzball
          .extractAsPromised(cleanNeedle, corpus[key], options)
          .then((res) => {
            console.timeEnd(needle + "." + key);
            return res;
          }),
      ];
    }),
    { concurrency: 1 }
  )) as unknown as Results;

  return results
    .filter((result) => result[1].length)
    .map((result) => ({
      type: result[0],
      initialScore: result[1][0].score,
      score:
        // this formula depends on input data.
        result[1][0].score *
        Math.min(0.1, Math.max(0.005, result[1][0].choice.freq / 10)),
    }))
    .sort((res1: FuzzySearchResult, res2: FuzzySearchResult) => {
      return res2.score - res1.score;
    });
};
