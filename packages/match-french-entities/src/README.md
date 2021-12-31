# @socialgouv/match-french-entities

Détecte le type de contenu dans la `string` envoyée à l'aide de jeux de données et d'heuristiques.

```js
import { match } from "@socialgouv/match-french-entities";

const result = await match("81 Rue du Charolais, 75012 Paris");

console.log(result);

// -> { type: "adresse", score: 100}
```

## Patterns

Les patterns sont gérés dans le fichier [`config.json`](./config.json).

## Datasets

Les données utilisées pour les index sont générées dans `./data` et issues de ces jeux de donnnées :

- https://www.data.gouv.fr/fr/datasets/liste-de-prenoms-et-patronymes/
- https://public.opendatasoft.com/explore/dataset/correspondance-code-insee-code-postal/export/?flg=fr

## Tests

```
  PASS  src/__tests__/match.spec.ts (7.247 s)
  ✓ Etablissement public de santé should be "text" (1216 ms)
  ✓ Julien should be "nom" (5 ms)
  ✓ Martin should be "nom" (6 ms)
  ✓ Céline should be "prenom" (5 ms)
  ✓ Celine should be "prenom" (4 ms)
  ✓ CELINE should be "prenom" (4 ms)
  ✓ mont de marsan should be "ville" (44 ms)
  ✓ Larbi should be "nom" (1 ms)
  ✓ Leila should be "prenom" (1 ms)
  ✓ Henri de la tour should be "fullname" (167 ms)
  ✓ de la verriere should be "ville" (44 ms)
  ✓ Emmanuel should be "prenom" (3 ms)
  ✓ Catherine should be "prenom" (4 ms)
  ✓ CATHERINE should be "prenom" (3 ms)
  ✓ Pinard should be "nom" (4 ms)
  ✓ Pinardo should be "nom" (3 ms)
  ✓ bouquillon should be "nom" (15 ms)
  ✓ saint etienne should be "ville" (19 ms)
  ✓ saint-etienne should be "ville" (19 ms)
  ✓ sens should be "ville" (1 ms)
  ✓ pedro should be "nom" (1 ms)
  ✓ maalik should be "prenom" (4 ms)
  ✓ anderson should be "nom" (4 ms)
  ✓ Rochefourchat should be "text" (17 ms)
  ✓ villeneuve saint georges should be "ville" (184 ms)
  ✓ saint-clement should be "ville" (19 ms)
  ✓ paris should be "ville" (1 ms)
  ✓ mlle should be "civilite" (1 ms)
  ✓ Mr should be "civilite" (1 ms)
  ✓ 10/10/2010 should be "date_fr"
  ✓ 2010-12-31 should be "date" (1 ms)
  ✓ 2010-12-31T09:00:00 should be "datetime"
  ✓ 2010-12-31T10:59:46.538Z should be "datetime"
  ✓ Homme should be "sexe"
  ✓ 75012 should be "cp" (1 ms)
  ✓ 89100 should be "cp"
  ✓ 2a should be "cp"
  ✓ test@test.com should be "email" (1 ms)
  ✓ 42.765765,4.876875 should be "geo"
  ✓ +33 01 4243 43 22 should be "tel"
  ✓ +33 1 4243 43 22 should be "tel"
  ✓ 0142434322 should be "tel" (1 ms)
  ✓ 1.1.1.1 should be "ip"
  ✓ 4325 should be "integer"
  ✓ 1.4325 should be "float"
  ✓ 1,4325 should be "float" (1 ms)
  ✓ 123456789 should be "siren"
  ✓ 12345678900012 should be "siret"
  ✓ 3, place carnot should be "adresse"
  ✓ place carnot should be "adresse" (1 ms)
  ✓ 9 Boulevard montparnasse, les mureaux should be "adresse"
  ✓ 78 ter rue des ormes should be "adresse"
  ✓ un texte quelconque should be "text" (283 ms)
  ✓ http://some.url should be "url"
  ✓ https://some.url/x/y?a=42#some-hash should be "url"
  ✓ Julien Martin should be "fullname" (33 ms)
  ✓ Francois du pont should be "fullname" (150 ms)
  ✓ Francois le ber should be "fullname" (165 ms)
  ✓ Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries should be "text" (1 ms)

```
