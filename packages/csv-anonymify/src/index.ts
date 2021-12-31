import * as csv from "csv";
import fs from "fs";

type ColumnOption = {
  name: string;
  type: string;
};

type AnonymifyOptions = csv.parser.Options & {
  onProgress?: onProgressFunction;
  fields?: ColumnOption[];
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
    if (options.fields && options.fields.length) {
      const newValues = options.fields
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

const test = async () => {
  const input = fs.createReadStream("./sample.csv");

  const anonymiser = anonymify(input, {
    onProgress: console.log,
    fields: [{ name: "civilite", type: "sexe" }],
  });

  anonymiser.pipe(fs.createWriteStream("./sample2.csv"));
};

test();
