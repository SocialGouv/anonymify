# @socialgouv/csv-anonymify

Anonymise un CSV

Les types de données sont détectés avec [@socialgouv/match-entities](https://github.com/socialgouv/anonymify).

## Usage

### NodeJs

```js
import fs from "fs";
import { anonymify } from "@socialgouv/csv-anonymify";

const options = {
  onProgress: console.log,
  columns: [{ name: "nom", type: "fullname" }],
  delimiter: ",",
};

const input = fs.createReadStream("./sample.csv");

const anonymiser = anonymify(input, {
  onProgress: console.log,
  fields: [{ name: "civilite", type: "sexe" }],
});

anonymiser.pipe(fs.createWriteStream("./anonymised.csv"));
```

### Browser :

See demo application in `/apps/csv` using `FileReader` streaming APIs
