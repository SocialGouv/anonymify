import * as csv from "csv";
import pAll from "p-all";

import { match } from "@socialgouv/match-entities";

const READ_SIZE = 1000; // read first lines of CSV
const SAMPLE_SIZE = 50; // random rows to pick

type Row = Record<string, any>;

type SampleOptions = {
  onProgress?: onProgressFunction;
  parse?: Record<string, any>;
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

interface onProgressFunction {
  (progress: Progress): void;
}

const isValidValue = (val: string) =>
  val && val.replace(/[\s]/g, "").length > 0;

const uniq = (arr: any[]) => Array.from(new Set(arr));

const getRandomItems = (arr: any[], n: number) => {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len) return arr;
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
};

// get single row from a csv
const getCsvRow = (
  readStream: Buffer,
  options: Record<string, any>,
  index: number
): Promise<Row[]> => {
  const parse = csv.parse(options);
  let lines = 0;
  return new Promise((resolve, reject) => {
    parse.on("error", (e: Error) => {
      console.log(e);
      reject(e);
      throw e;
    });

    parse.on("data", (row: any) => {
      if (lines === index) {
        resolve(row);
        parse.end();
      }
      //records.push(row);
      lines += 1;
    });
    parse.write(readStream);
    parse.end();
  });
};

// get random rows from a csv
const getRandomRows = (
  readStream: Buffer,
  options: Record<string, any>,
  sampleSize: number = SAMPLE_SIZE
): Promise<Row[]> => {
  const parse = csv.parse(options);

  let lines = 0;
  return new Promise((resolve, reject) => {
    parse.on("error", (e: Error) => {
      console.log(e);
      reject(e);
      throw e;
    });
    parse.on("end", async () => {
      const randomIndexes = getRandomItems(
        Array.from({ length: lines }, (_, v) => v),
        sampleSize
      );
      const randomRecords = await pAll(
        randomIndexes.map(
          (index) => () => getCsvRow(readStream, options, index)
        ),
        { concurrency: 1 }
      );
      resolve(randomRecords);
    });

    parse.on("data", (row: any) => {
      lines += 1;
    });
    parse.write(readStream);
    parse.end();
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
    arr.filter(Boolean).reduce((a, rec) => {
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

const wait = (args: any) =>
  new Promise((resolve) => setTimeout(() => resolve(args), 1));

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
        const detectedTypes = (await pAll(
          sample.values.map(
            (value: string) => async () =>
              Promise.resolve((await match(value))[0]).then(wait)
          ),
          { concurrency: 1 }
        )) as Row[];
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

export const sample = async (
  readStream: Buffer,
  options: SampleOptions = {}
): Promise<SampleResult[]> => {
  const allOptions = {
    onProgress: ({ status, msg }: Progress): void => {},
    parse: {},
    ...options,
  };

  allOptions.onProgress({
    status: "running",
    msg: "read random rows from CSV",
  });
  const csvOptions = {
    columns: true,
    relax_quotes: true,
    delimiter: ";",
    to: READ_SIZE,
    //skip_records_with_error: true,
    ...options.parse,
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
