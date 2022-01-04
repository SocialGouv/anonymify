import * as csv from "csv";
import fs from "fs";

import type { MatchEntity } from "@socialgouv/match-entities";

import { transformers } from "./transformers";

export type AnonymiseColumnOption = {
  name: string;
  type: MatchEntity;
  metadata?: Record<string, any>;
};
export type AnonymiseColumnOptions = AnonymiseColumnOption[];

export type AnonymifyOptions = Omit<csv.parser.Options, "columns"> & {
  onProgress?: onProgressFunction;
  columns?: AnonymiseColumnOptions;
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
  const parser = csv.parse({
    delimiter: ";",
    columns: true,
  });

  const transformer = csv.transform({ parallel: 1 }, (data) => {
    if (options.columns && options.columns.length) {
      const newValues = options.columns
        .map(({ name, type, metadata }) => {
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
          return {
            name,
            value,
          };
        })
        .reduce((a, c) => ({ ...a, [c.name]: c.value }), {});
      return {
        ...data,
        ...newValues,
      };
    }
    return data;
  });

  const outStream = readStream
    .pipe(parser)
    .pipe(transformer)
    .pipe(csv.stringify({ delimiter: ";", header: true }));

  transformer.on("error", function (err) {
    console.error(err.message);
  });

  return outStream;
};
