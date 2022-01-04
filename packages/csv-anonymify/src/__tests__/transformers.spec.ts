import faker from "faker/locale/fr";

import { MatchEntity } from "@socialgouv/match-entities";
import { transformers } from "../transformers";

faker.seed(1234);

jest.useFakeTimers().setSystemTime(new Date("2020-01-01").getTime());

const tests = [
  "address",
  "city",
  "date_fr",
  "date",
  "datetime",
  "email",
  "firstname",
  "float",
  "fullname",
  "geo",
  "integer",
  "ip",
  "json",
  "lastname",
  "phone",
  "postcode",
  "sex",
  "siren",
  "siret",
  "text",
  "title",
  "url",
] as MatchEntity[];

tests.forEach((t) => {
  test(`should anonymise ${t}`, () => {
    expect(transformers[t]()).toMatchSnapshot();
  });
});
