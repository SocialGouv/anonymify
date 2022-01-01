import * as csv from "csv";
import fs from "fs";
import faker from "faker/locale/fr";

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

const transforms = {
  fullname: () => faker.name.findName(),
  prenom: () => faker.name.firstName(),
  nom: () => faker.name.lastName(),
  adresse: () => faker.address.streetAddress(),
  email: () => faker.internet.email(),
  url: () => faker.internet.url(),
  ip: () => faker.internet.ip(),
  tel: () => faker.phone.phoneNumber(),
  integer: () => "" + faker.datatype.number(),
  float: () => "" + faker.datatype.float(),
  geo: () => faker.fake("{{address.latitude}}, {{address.longitude}}"),
  text: () => faker.lorem.words(),
  json: () => JSON.stringify({ hello: "world" }),
} as Record<string, any>;

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
        .map(({ name, type }) => {
          const value = (transforms[type] && transforms[type]()) || "x";
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
