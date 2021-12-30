import * as csv from "csv";
import fs from "fs";
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
  readStream: fs.ReadStream,
  options: Record<string, any>
): Promise<Row[]> => {
  const parse = csv.parse(options);
  const readStreamPipe = readStream.pipe(parse);

  const records: Row[] = [];

  return new Promise((resolve, reject) => {
    readStreamPipe.on("error", (e) => {
      console.log(e);
      reject(e);
      throw e;
    });
    readStreamPipe.on("end", () => {
      const randomRecords = pickRandom(records, options.to);
      resolve(randomRecords);
    });
    readStreamPipe.on("data", (row) => {
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

// for given samples, detect the data type
const guessColumnsTypes = (samples: Sample[], onProgress: Function) =>
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
        onProgress(`detect column ${sample.name}`);
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
  onProgress?: Function;
  parse?: ParserOptions;
};

type SampleResult = {
  name: string;
  type: string;
  values: string[];
};

export const sample = async (
  readStream: fs.ReadStream,
  options: SampleOptions = {}
): Promise<SampleResult[]> => {
  const allOptions = {
    onProgress: (str: string) => null,
    parse: {},
    ...options,
  };

  allOptions.onProgress("read random rows from CSV");
  const csvOptions = {
    delimiter: ";",
    ...options.parse,
    columns: true,
    to: 50,
  };

  allOptions.onProgress("extract random records");
  const records = await getRandomRows(readStream, csvOptions);

  allOptions.onProgress("sample CSV data");
  const samples = getColumnsSamples(records);

  allOptions.onProgress("guess columns types");
  const columns = await guessColumnsTypes(samples, allOptions.onProgress);
  allOptions.onProgress("finished");

  return columns;
};
