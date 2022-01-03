import * as csv from "csv";
import fs from "fs";
import faker from "faker/locale/fr";

import { MatchEntity } from "@socialgouv/match-entities";

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

// todo: handle config.items formats
const transforms = {
  fullname: (options: any) => faker.name.findName(options),
  firstname: (options: any) => faker.name.firstName(options),
  lastname: (options: any) => faker.name.lastName(options),
  address: (options: any) => faker.address.streetAddress(options),
  city: (options: any) => faker.address.city(options),
  email: (options: any) => faker.internet.email(options),
  url: (options: any) => faker.internet.url(),
  ip: (options: any) => faker.internet.ip(),
  phone: (options: any) => faker.phone.phoneNumber(options),
  integer: (options: any) => "" + faker.datatype.number(options),
  float: (options: any) => "" + faker.datatype.float(options),
  geo: (options: any) =>
    faker.fake("{{address.latitude}}, {{address.longitude}}"),
  text: (options: any) => faker.lorem.words(options),
  json: (options: any) => JSON.stringify({ hello: "world" }),
} as Record<MatchEntity, any>;

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
          const value = (transforms[type] && transforms[type](options)) || "x";
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
