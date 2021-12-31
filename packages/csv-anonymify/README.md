# @socialgouv/csv-anonymify

Anonymise un CSV

Les types de données sont détectés avec [@socialgouv/match-french-entities](https://github.com/socialgouv/match-french-entities).

## Usage

```js
import fs from "fs";
import { anonymify } from "@socialgouv/csv-anonymify";

const options = {
  onProgress: console.log,
  columns: {
    nom: {
      type: "fullname",
    },
  },
  delimiter: ",",
};

const input = fs.createReadStream("./sample.csv");

const anonymiser = anonymify(input, {
  onProgress: console.log,
  fields: [{ name: "civilite", type: "sexe" }],
});

anonymiser.pipe(fs.createWriteStream("./anonymised.csv"));
```
