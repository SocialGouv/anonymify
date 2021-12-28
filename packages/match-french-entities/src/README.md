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
 PASS  src/__tests__/match.spec.ts (39.798 s)
  ✓ Julien should be "nom" (852 ms)
  ✓ Martin should be "nom" (871 ms)
  ✓ Céline should be "prenom" (696 ms)
  ✓ Celine should be "prenom" (916 ms)
  ✓ CELINE should be "prenom" (895 ms)
  ✓ mont de marsan should be "ville" (2143 ms)
  ✓ momo should be "prenom" (568 ms)
  ✓ Larbi should be "nom" (724 ms)
  ✓ Leila should be "prenom" (1092 ms)
  ✓ Gus should be "prenom" (717 ms)
  ✓ Henri de la tour should be "text" (2716 ms)
  ✓ de la verriere should be "ville" (1958 ms)
  ✓ Emmanuel should be "prenom" (1114 ms)
  ✓ Catherine should be "prenom" (1240 ms)
  ✓ CATHERINE should be "prenom" (1247 ms)
  ✓ Pinard should be "nom" (842 ms)
  ✓ Pinardo should be "nom" (990 ms)
  ✓ bouquillon should be "nom" (1357 ms)
  ✓ saint etienne should be "ville" (1748 ms)
  ✓ sens should be "nom" (555 ms)
  ✓ pedro should be "nom" (695 ms)
  ✓ maalik should be "nom" (822 ms)
  ✓ anderson should be "nom" (1099 ms)
  ✓ Rochefourchat should be "nom" (1746 ms)
  ✓ Ornes should be "ville" (752 ms)
  ✓ villeneuve saint georges should be "ville" (3411 ms)
  ✓ saint-clement should be "ville" (1753 ms)
  ✓ paris should be "ville" (686 ms)
  ✓ mlle should be "titre"
  ✓ Mr should be "titre"
  ✓ 10/10/2010 should be "date" (1 ms)
  ✓ Homme should be "sexe"
  ✓ 75012 should be "cp"
  ✓ 89100 should be "cp"
  ✓ 2a should be "cp"
  ✓ test@test.com should be "email"
  ✓ 42.765765,4.876875 should be "geo" (1 ms)
  ✓ +33 01 4243 43 22 should be "tel"
  ✓ +33 1 4243 43 22 should be "tel"
  ✓ 0142434322 should be "tel"
  ✓ 1.1.1.1 should be "ip"
  ✓ 4325 should be "number" (1 ms)
  ✓ 1.4325 should be "number"
  ✓ 1,4325 should be "number"
  ✓ 123456789 should be "siren"
  ✓ 12345678900012 should be "siret" (1 ms)
  ✓ 3, place carnot should be "adresse"
  ✓ place carnot should be "adresse"
  ✓ 9 Boulevard montparnasse, les mureaux should be "adresse"
  ✓ 78 ter rue des ormes should be "adresse"
  ✓ un texte quelconque should be "text" (2549 ms)
  ✓ Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries should be "text"
```
