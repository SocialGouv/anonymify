# @socialgouv/match-french-entities

Détecte le type de contenu dans la `string` envoyée.

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
 PASS  src/__tests__/match.spec.ts (18.385 s)
  ✓ Julien should be "prenom" (399 ms)
  ✓ Martin should be "nom" (363 ms)
  ✓ Céline should be "prenom" (321 ms)
  ✓ Celine should be "prenom" (358 ms)
  ✓ CELINE should be "prenom" (363 ms)
  ✓ mont de marsan should be "ville" (821 ms)
  ✓ Larbi should be "prenom" (302 ms)
  ✓ Leila should be "prenom" (300 ms)
  ✓ Gus should be "text" (190 ms)
  ✓ Henri de la tour should be "text" (932 ms)
  ✓ de la verriere should be "ville" (813 ms)
  ✓ Emmanuel should be "nom" (475 ms)
  ✓ Catherine should be "prenom" (531 ms)
  ✓ CATHERINE should be "prenom" (531 ms)
  ✓ Pinard should be "nom" (360 ms)
  ✓ Pinardo should be "nom" (419 ms)
  ✓ bouquillon should be "nom" (582 ms)
  ✓ saint etienne should be "ville" (980 ms)
  ✓ sens should be "nom" (256 ms)
  ✓ pedro should be "prenom" (533 ms)
  ✓ maalik should be "nom" (360 ms)
  ✓ anderson should be "nom" (694 ms)
  ✓ Rochefourchat should be "nom" (753 ms)
  ✓ villeneuve saint georges should be "ville" (1388 ms)
  ✓ saint-clement should be "ville" (756 ms)
  ✓ paris should be "ville" (303 ms)
  ✓ mlle should be "civilite"
  ✓ Mr should be "civilite" (1 ms)
  ✓ 10/10/2010 should be "date"
  ✓ Homme should be "sexe"
  ✓ 75012 should be "cp" (1 ms)
  ✓ 89100 should be "cp"
  ✓ 2a should be "cp"
  ✓ test@test.com should be "email" (1 ms)
  ✓ 42.765765,4.876875 should be "geo"
  ✓ +33 01 4243 43 22 should be "tel"
  ✓ +33 1 4243 43 22 should be "tel"
  ✓ 0142434322 should be "tel"
  ✓ 1.1.1.1 should be "ip" (1 ms)
  ✓ 4325 should be "integer"
  ✓ 1.4325 should be "float"
  ✓ 1,4325 should be "float"
  ✓ 123456789 should be "siren"
  ✓ 12345678900012 should be "siret"
  ✓ 3, place carnot should be "adresse" (1 ms)
  ✓ place carnot should be "adresse"
  ✓ 9 Boulevard montparnasse, les mureaux should be "adresse"
  ✓ 78 ter rue des ormes should be "adresse"
  ✓ un texte quelconque should be "text" (1101 ms)
  ✓ http://some.url should be "url"
  ✓ https://some.url/x/y?a=42#some-hash should be "url"
  ✓ Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries should be "text"

```
