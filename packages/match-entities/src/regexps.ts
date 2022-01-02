export const match = (needle: string, regexps: string[]) =>
  (needle &&
    regexps
      .map((regex) => needle.match && needle.match(new RegExp(regex, "im")))
      .filter(Boolean).length > 0) ||
  false;
