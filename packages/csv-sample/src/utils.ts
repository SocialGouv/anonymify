import * as csv from "csv";
import pAll from "p-all";

const SAMPLE_SIZE = 50; // random rows to pick

export type Row = Record<string, any>;

const isValidValue = (val: string) =>
  val && val.replace(/[\s]/g, "").length > 0;

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

// extract the most present value for a given list of records and a given key
export const topKey = (arr: Row[], key: string): string | undefined => {
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
  if (totals.length && totals[0].length) {
    return totals[0][0];
  }
};

export const wait = (args: any) =>
  new Promise((resolve) => setTimeout(() => resolve(args), 1));

export const median = (arr: number[]) => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

// dummy delimiter detector
export const getDelimiter = async (readStream: Buffer) => {
  let delimiter = ";";
  try {
    const firstRow = await getCsvRow(readStream, { delimiter }, 0);
    if (firstRow.length === 1) {
      // row is not parsed correctly, fallback to `,`
      // todo: make it better, this prevent using single-column CSVs
      delimiter = ",";
    }
  } catch (e: any) {
    // row is not parsed correctly, fallback to `,`
    console.error("getCsvRow error", e.message);
    delimiter = ",";
  }
  return delimiter;
};

export const uniq = (arr: any[]) => Array.from(new Set(arr));

export // get single row from a csv
const getCsvRow = (
  readStream: Buffer,
  options: Record<string, any>,
  index: number
): Promise<Row[]> => {
  const parse = csv.parse(options);
  let lines = 0;
  return new Promise((resolve, reject) => {
    parse.on("error", (e: Error) => {
      console.error("parse error", e.message);
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

export // get random rows from a csv
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
      const randomIndexes = process.env.TEST
        ? Array.from({ length: sampleSize }, (_, v) => v)
        : getRandomItems(
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

// return unique values for each column
export const getColumnsSamples = (rows: Row[]) => {
  const firstRecord = rows.length && rows[0];
  if (firstRecord) {
    return Object.keys(firstRecord).map((key) => ({
      name: key,
      values: uniq(rows.map((rec) => rec[key]).filter(isValidValue)),
    }));
  }
  return [];
};
