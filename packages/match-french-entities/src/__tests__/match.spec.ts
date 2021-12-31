import { match } from "../index";

const tests = [
  { input: "Julien", expected: "prenom" },
  { input: "Martin", expected: "nom" },
  { input: "Céline", expected: "prenom" },
  { input: "Celine", expected: "prenom" },
  { input: "CELINE", expected: "prenom" },
  { input: "mont de marsan", expected: "ville" },
  { input: "Larbi", expected: "prenom" },
  { input: "Leila", expected: "prenom" },
  { input: "Gus", expected: "text" },
  { input: "Henri de la tour", expected: "text" },
  { input: "de la verriere", expected: "ville" },
  { input: "Emmanuel", expected: "nom" },
  { input: "Catherine", expected: "prenom" },
  { input: "CATHERINE", expected: "prenom" },
  { input: "Pinard", expected: "nom" },
  { input: "Pinardo", expected: "nom" },
  { input: "bouquillon", expected: "nom" },
  { input: "saint etienne", expected: "ville" },
  { input: "sens", expected: "nom" },
  { input: "pedro", expected: "prenom" },
  { input: "maalik", expected: "nom" },
  { input: "anderson", expected: "nom" },
  { input: "Rochefourchat", expected: "nom" },
  { input: "villeneuve saint georges", expected: "ville" },
  { input: "saint-clement", expected: "ville" },
  { input: "paris", expected: "ville" },
  { input: "mlle", expected: "civilite" },
  { input: "Mr", expected: "civilite" },
  { input: "10/10/2010", expected: "date" },
  { input: "Homme", expected: "sexe" },
  { input: "75012", expected: "cp" },
  { input: "89100", expected: "cp" },
  { input: "2a", expected: "cp" },
  { input: "test@test.com", expected: "email" },
  { input: "42.765765,4.876875", expected: "geo" },
  { input: "+33 01 4243 43 22", expected: "tel" },
  { input: "+33 1 4243 43 22", expected: "tel" },
  { input: "0142434322", expected: "tel" },
  { input: "1.1.1.1", expected: "ip" },
  { input: "4325", expected: "integer" },
  { input: "1.4325", expected: "float" },
  { input: "1,4325", expected: "float" },
  { input: "123456789", expected: "siren" },
  { input: "12345678900012", expected: "siret" },
  { input: "3, place carnot", expected: "adresse" },
  { input: "place carnot", expected: "adresse" },
  { input: "9 Boulevard montparnasse, les mureaux", expected: "adresse" },
  { input: "78 ter rue des ormes", expected: "adresse" },
  { input: "un texte quelconque", expected: "text" },
  { input: "http://some.url", expected: "url" },
  { input: "https://some.url/x/y?a=42#some-hash", expected: "url" },
  {
    input:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    expected: "text",
  },
];

tests.forEach((t) => {
  test(`${t.input} should be "${t.expected}"`, async () => {
    const results = await match(t.input);
    expect(results[0].type).toEqual(t.expected);
  });
});
