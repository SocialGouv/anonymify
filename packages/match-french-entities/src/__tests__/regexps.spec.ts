import { match } from "../regexps";

const truthy = [
  "26/10/44",
  "26/10/1944",
  "26-10-1944",
  "3-6-1944",
  "1944-12-31",
  "1944-1-2",
];

const falsy = ["", "0", 0, null, "1/1/1", "some-date"];

const regexps = [
  "^\\d\\d?[/-]\\d\\d?[/-]\\d\\d(\\d\\d)?$",
  "^\\d{4}[/-]\\d\\d?[/-]\\d\\d?$",
];

truthy.forEach((t) => {
  test(`${t} should be true`, () => {
    expect(match(t, regexps)).toEqual(true);
  });
});

falsy.forEach((t: any) => {
  test(`${t} should be false`, () => {
    expect(match(t, regexps)).toEqual(false);
  });
});
