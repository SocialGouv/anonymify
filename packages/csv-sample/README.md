# @socialgouv/csv-sample

Renvoie le type de données pour chaque colonne d'un CSV.

Les types de données sont détectés avec [@socialgouv/match-french-entities](https://github.com/socialgouv/match-french-entities).

## Usage

```js
import fs from "fs";
import { sample } from "@socialgouv/csv-sample";

const input = fs.createReadStream("./sample.csv");

const samples = await sample(input, { onProgress: console.log });

console.log(samples);
```
