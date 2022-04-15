# @socialgouv/csv-anonymify

Anonymise un CSV

Les types de données sont détectés avec [@socialgouv/match-entities](https://github.com/SocialGouv/anonymify/tree/main/packages/match-entities).

## Usage

### NodeJs

```js
import fs from "fs";
import { anonymify } from "@socialgouv/csv-anonymify";

const input = fs.createReadStream("./sample.csv");

const anonymiser = anonymify(input, {
  onProgress: console.log,
  fields: [{ name: "civilite", type: "sex" }],
});

anonymiser.pipe(fs.createWriteStream("./sample-anonymised.csv"));
```

### Browser :

See demo application in `/apps/csv` using `FileReader` streaming APIs
