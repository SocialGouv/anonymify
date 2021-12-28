import { search } from "../index";

const tests = [
  { input: "Julien", expected: "nom" },
  { input: "Martin", expected: "nom" },
  { input: "Céline", expected: "prenom" },
  { input: "Celine", expected: "prenom" },
  { input: "CELINE", expected: "prenom" },
  { input: "mont de marsan", expected: "ville" },
  { input: "momo", expected: "prenom" },
  { input: "Larbi", expected: "nom" },
  { input: "Leila", expected: "prenom" },
  { input: "Gus", expected: "prenom" },
  { input: "Henri de la tour", expected: "nom" },
  { input: "de la verriere", expected: "ville" },
  { input: "Emmanuel", expected: "prenom" },
  { input: "Catherine", expected: "prenom" },
  { input: "CATHERINE", expected: "prenom" },
  { input: "Pinard", expected: "nom" },
  { input: "Pinardo", expected: "nom" },
  { input: "bouquillon", expected: "nom" },
  { input: "saint etienne", expected: "ville" },
  { input: "sens", expected: "nom" },
  { input: "pedro", expected: "nom" },
  { input: "maalik", expected: "nom" },
  { input: "anderson", expected: "nom" },
  { input: "Rochefourchat", expected: "nom" },
  { input: "Ornes", expected: "ville" },
  { input: "villeneuve saint georges", expected: "ville" },
  { input: "saint-clement", expected: "ville" },
];

tests.forEach((t) => {
  test(`${t.input} should be "${t.expected}"`, async () => {
    const results = await search(t.input);
    expect(results[0].type).toEqual(t.expected);
  });
});
