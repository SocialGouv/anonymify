export const match = (needle: string, regexps: string[]) => {
  return (
    regexps
      .map(
        (regex) =>
          needle && needle.match && needle.match(new RegExp(regex, "im"))
      )
      .filter(Boolean).length > 0
  );
};