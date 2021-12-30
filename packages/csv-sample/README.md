# @socialgouv/csv-sample

Renvoie le type de données pour chaque colonne d'un CSV.

Les types de données sont détectés avec [@socialgouv/match-french-entities](https://github.com/socialgouv/match-french-entities).

## Usage

```js
import { sample } from "@socialgouv/csv-sample";

const readStream = fs.createReadStream(`./sample.csv`);

const samples = await sample(readStream, { onProgress: console.log });

console.log(samples);
```
