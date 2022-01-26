import * as csv from "csv";
import fs from "fs";

import type { MatchEntity } from "@socialgouv/match-entities";

import { transformers } from "./transformers";
import { seedValue } from "faker";

export type AnonymiseColumnOption = {
  name: string;
  type: MatchEntity;
  metadata?: Record<string, any>;
};
export type AnonymiseColumnOptions = AnonymiseColumnOption[];

export type AnonymifyOptions = Omit<csv.parser.Options, "columns"> & {
  onProgress?: onProgressFunction;
  columns?: AnonymiseColumnOptions;
  delimiter?: string;
};

type Progress = {
  status: string;
  msg?: string;
  records?: any[];
};

interface onProgressFunction {
  (progress: Progress): void;
}

export const anonymify = (
  readStream: fs.ReadStream,
  options: AnonymifyOptions = {}
) => {
  const delimiter = options.delimiter || ";";
  const parser = csv.parse({
    delimiter,
    columns: true,
    relax_quotes: true,
    skip_records_with_error: true,
  });

  const transformer = csv.transform({ parallel: 5 }, (data, callback) => {
    if (options.columns && options.columns.length) {
      const newRecord = options.columns.reduce(
        (newRecord, { name, type, metadata }) => {
          let options: any = undefined;
          if (metadata) {
            if (type === "integer") {
              options = {
                min: metadata.min || 0,
                max: metadata.max || 100000,
              };
            } else if (type === "float") {
              options = {
                min: metadata.min || 0,
                max: metadata.max || 100000,
              };
            } else if (type === "text") {
              if (metadata.maxLength === 1) {
                options = 1;
              } else {
                // compute arbitrary number of words
                options =
                  Math.round(
                    Math.random() * (metadata.maxLength - metadata.minLength) +
                      metadata.minLength
                  ) / 6;
              }
            }
          }
          const value =
            (transformers[type] && transformers[type](options)) || "x";

          return Object.assign(newRecord, { [name]: value });
        },
        {}
      );
      callback(null, Object.assign({}, data, newRecord));
    }
    return data;
  });

  const outStream = readStream
    .pipe(parser)
    .pipe(transformer)
    .pipe(csv.stringify({ delimiter, header: true }));

  transformer.on("error", function (err) {
    console.error(err.message);
  });

  return outStream;
};
