import faker from "faker/locale/fr";
import { format } from "date-fns";

import type { MatchEntity } from "@socialgouv/match-entities";

const leftPad = (s: string | number, length: number = 10) => {
  let padded = ("" + s).slice(0, length);
  while (padded.length < length) {
    padded = "0" + padded;
  }
  return padded;
};

// todo: handle config.items formats
export const transformers = {
  address: (options: any) => faker.address.streetAddress(options),
  city: (options: any) => faker.address.city(options),
  date_fr: (options: any) => format(faker.date.past(), "MM/dd/yyyy"),
  date: (options: any) => format(faker.date.past(), "yyyy-MM-dd"),
  datetime: (options: any) => faker.date.past().toISOString(),
  email: (options: any) => faker.internet.email(options),
  firstname: (options: any) => faker.name.firstName(options),
  float: (options: any) => "" + faker.datatype.float(options),
  fullname: (options: any) => faker.name.findName(options),
  geo: (options: any) =>
    faker.fake("{{address.latitude}},{{address.longitude}}"),
  integer: (options: any) => "" + faker.datatype.number(options),
  ip: (options: any) => faker.internet.ip(),
  json: (options: any) => JSON.stringify({ random: faker.lorem.word() }),
  lastname: (options: any) => faker.name.lastName(options),
  phone: (options: any) => faker.phone.phoneNumber(options),
  postcode: (options: any) =>
    leftPad(faker.datatype.number({ min: 10000, max: 96000 }), 5),
  sex: (options: any) => faker.random.arrayElement(["Homme", "Femme"]),
  siren: (options: any) =>
    leftPad(faker.datatype.number({ min: 100000000, max: 999999999 }), 9),
  siret: (options: any) =>
    leftPad(
      faker.datatype.number({ min: 10000000000000, max: 99999999999999 }),
      14
    ),
  text: (options: any) => faker.lorem.words(options),
  title: (options: any) => faker.random.arrayElement(["M.", "Mme."]),
  url: (options: any) => faker.internet.url(),
} as Record<MatchEntity, any>;
