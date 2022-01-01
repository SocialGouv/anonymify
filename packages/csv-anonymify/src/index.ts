import * as csv from "csv";
import fs from "fs";

type MyColumnOption = {
  name: string;
  type: string;
};

type AnonymifyOptions = Omit<csv.parser.Options, "columns"> & {
  onProgress?: onProgressFunction;
  columns?: MyColumnOption[];
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
  transformer.on("finish", function () {
    console.log("output", output.length);
  });

  return outStream;
};

// const test = async () => {
//   const input = fs.createReadStream("./sample.csv");

//   const anonymiser = anonymify(input, {
//     onProgress: console.log,
//     columns: [{ type: "sexe", name: "civilite" }],
//   });

//   anonymiser.pipe(fs.createWriteStream("./sample2.csv"));
// };

// test();
