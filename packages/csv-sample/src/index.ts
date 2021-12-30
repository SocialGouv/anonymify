import * as csv from "csv";
import pAll from "p-all";

import { match } from "@socialgouv/match-french-entities";
import { ParserOptions } from "prettier";

type Row = Record<string, any>;

const isValidValue = (val: string) =>
  val && val.replace(/[\s]/g, "").length > 0;

const uniq = (arr: any[]) => Array.from(new Set(arr));

const pickRandom = (arr: any[], maxCount: number) => {
  const picked = [];
  const length = arr.length;
  if (length <= maxCount) {
    return arr;
  }
  while (picked.length < maxCount) {
    const randomIndex = Math.round(Math.random() * length);
    picked.push(arr[randomIndex]);
  }
  return picked;
};

// get random rows from a csv
const getRandomRows = (
  readStream: Buffer,
  options: Record<string, any>
): Promise<Row[]> => {
  const parse = csv.parse(options);
  parse.write(readStream);

  // const readStreamPipe = readStream.pipeThrough(parse);
  //parse.write(readStream);
  const records: Row[] = [];

  return new Promise((resolve, reject) => {
    parse.on("error", (e: Error) => {
      console.log(e);
      reject(e);
      throw e;
    });
    parse.on("end", () => {
      const randomRecords = pickRandom(records, options.to);
      resolve(randomRecords);
    });
    parse.on("data", (row: any) => {
      records.push(row);
    });
  });
};

const getColumnsSamples = (rows: Row[]) => {
  const firstRecord = rows.length && rows[0];
  if (firstRecord) {
    return Object.keys(firstRecord).map((key) => ({
      name: key,
      values: uniq(rows.map((rec) => rec[key]).filter(isValidValue)),
    }));
  }
  return [];
};

// extract the most present value for a given list of records and a given key
const topKey = (arr: Row[], key: string): string => {
  if (arr.length === 1) {
    return arr[0][key];
  }
  const totals = Object.entries(
    arr.reduce((a, rec) => {
      if (!a[rec[key]]) {
        a[rec[key]] = 0;
      }
      a[rec[key]] += 1;
      return a;
    }, {})
  );

  totals
    .sort((a, b) => {
      return a[1] - b[1];
    })
    .reverse();

  return totals[0][0];
};

type Sample = {
  name: string;
  values: string[];
};

interface onProgressFunction {
  (progress: Progress): void;
}

// for given samples, detect the data type
const guessColumnsTypes = (samples: Sample[], onProgress: onProgressFunction) =>
  pAll(
    samples.map((sample: Sample) => async () => {
      if (sample.values.length === 0) {
        return {
          ...sample,
          type: "empty",
        };
      } else if (sample.values.length === 1) {
        return {
          ...sample,
          type: "fixed",
        };
      } else if (sample.values.length > 1) {
        onProgress({ status: "detect", msg: `detect column ${sample.name}` });
        const detectedTypes = await pAll(
          sample.values.map(
            (value: string) => async () => (await match(value))[0]
          ),
          { concurrency: 1 }
        );
        const detectedType = topKey(detectedTypes, "type");
        return {
          ...sample,
          type: detectedType,
        };
      }
      return {
        ...sample,
        type: "unknown",
      };
    }),
    { concurrency: 1 }
  );

type SampleOptions = {
  onProgress?: onProgressFunction;
  parse?: ParserOptions;
};

type SampleResult = {
  name: string;
  type: string;
  values: string[];
};

type Progress = {
  status: string;
  msg?: string;
  records?: any[];
};

export const sample = async (
  readStream: Buffer,
  options: SampleOptions = {}
): Promise<SampleResult[]> => {
  const allOptions = {
    onProgress: ({ status, msg }: Progress): void => {},
    parse: {},
    ...options,
  };

  console.log("readStream", readStream);

  allOptions.onProgress({
    status: "running",
    msg: "read random rows from CSV",
  });
  const csvOptions = {
    delimiter: ";",
    ...options.parse,
    columns: true,
    to: 50,
  };

  allOptions.onProgress({
    status: "running",
    msg: "extract random records",
  });
  const records = await getRandomRows(readStream, csvOptions);

  allOptions.onProgress({
    status: "samples",
    msg: "extract random records",
    records,
  });

  allOptions.onProgress({
    status: "running",
    msg: "sample CSV data",
  });
  const samples = getColumnsSamples(records);

  allOptions.onProgress({
    status: "running",
    msg: "guess columns types",
  });
  const columns = await guessColumnsTypes(samples, allOptions.onProgress);

  allOptions.onProgress({
    status: "finished",
  });

  return columns;
};
