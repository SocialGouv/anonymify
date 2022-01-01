import * as csv from "csv";
import fs from "fs";

export type AnonymiseColumnOption = {
  name: string;
  type: string;
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
  const output: any[] = [];
  const parser = csv.parse({
    delimiter: ";",
    columns: true,
  });

  const transformer = csv.transform({ parallel: 1 }, (data) => {
    if (options.columns && options.columns.length) {
      const newValues = options.columns
        .map(({ name, type }) => {
          return {
            name,
            value: "xxxx",
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
    .pipe(csv.stringify({ delimiter: ";" }));

  transformer.on("error", function (err) {
    console.error(err.message);
  });

  return outStream;
};
