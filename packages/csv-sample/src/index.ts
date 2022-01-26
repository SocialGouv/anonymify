import pAll from "p-all";

import { match } from "@socialgouv/match-entities";

import {
  getDelimiter,
  getRandomRows,
  getColumnsSamples,
  Row,
  topKey,
  wait,
  median,
} from "./utils";

export { getDelimiter } from "./utils";

const READ_SIZE = 1000; // read first lines of CSV

type SampleOptions = {
  onProgress?: onProgressFunction;
  parse?: Record<string, any>;
};

export type MetadataRecord = Record<string, any>;

type SampleResult = {
  name: string;
  type: string;
  values: string[];
  metadata?: MetadataRecord;
};

type Progress = {
  status: string;
  msg?: string;
  records?: any[];
};

interface onProgressFunction {
  (progress: Progress): void;
}

type Sample = {
  name: string;
  values: string[];
};

// for given samples, detect the data type
const guessColumnsTypes = (samples: Sample[], onProgress: onProgressFunction) =>
  pAll(
    samples.map((sample: Sample) => async () => {
      if (sample.values.length === 0) {
        // no content found
        return {
          ...sample,
          type: "empty",
        };
      } else if (sample.values.length === 1) {
        // single-value found
        return {
          ...sample,
          type: "fixed",
        };
      } else if (sample.values.length > 1) {
        onProgress({ status: "detect", msg: `detect column ${sample.name}` });
        // try to fuzzy guess the content type
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

// add some metadata about column content
const addColumnMetadata = (column: SampleResult) => {
  const metadata: MetadataRecord = {};
  if (column.type === "text") {
    const lengths = column.values.map((s) => s.length);
    metadata.minLength = Math.min(...lengths);
    metadata.maxLength = Math.max(...lengths);
    metadata.medianLength = median(lengths);
  } else if (column.type === "integer") {
    metadata.min = Math.min(...column.values.map((s) => parseFloat(s)));
    metadata.max = Math.max(...column.values.map((s) => parseFloat(s)));
    metadata.median = median(column.values.map((s) => parseFloat(s)));
  } else if (column.type === "float") {
    metadata.min = Math.min(...column.values.map((s) => parseFloat(s)));
    metadata.max = Math.max(...column.values.map((s) => parseFloat(s)));
    metadata.median = median(column.values.map((s) => parseFloat(s)));
  }
  return {
    ...column,
    metadata,
  };
};

export const sample = async (
  readStream: Buffer,
  options: SampleOptions = {}
): Promise<SampleResult[]> => {
  const sampleOptions = {
    onProgress: ({ status, msg }: Progress): void => {},
    parse: {},
    ...options,
  };

  sampleOptions.onProgress({
    status: "running",
    msg: "detect CSV delimiter",
  });

  const delimiter = await getDelimiter(readStream);

  sampleOptions.onProgress({
    status: "running",
    msg: "read random rows from CSV",
  });

  const csvOptions = {
    columns: true,
    relax_quotes: true,
    delimiter,
    to: READ_SIZE,
    //skip_records_with_error: true,
    ...options.parse,
  };

  sampleOptions.onProgress({
    status: "running",
    msg: "extract random records",
  });
  const records = await getRandomRows(readStream, csvOptions);

  sampleOptions.onProgress({
    status: "samples",
    msg: "extract random records",
    records,
  });

  sampleOptions.onProgress({
    status: "running",
    msg: "sample CSV data",
  });
  const samples = getColumnsSamples(records);

  sampleOptions.onProgress({
    status: "running",
    msg: "guess columns types",
  });

  const columns = (
    await guessColumnsTypes(samples, sampleOptions.onProgress)
  ).map(addColumnMetadata);

  sampleOptions.onProgress({
    status: "finished",
  });

  return columns;
};
