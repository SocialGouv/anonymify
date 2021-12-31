import MiniSearch from "minisearch";

import prenoms from "../data/prenoms.json";
import noms from "../data/noms.json";
import villes from "../data/villes.json";

const miniSearch = new MiniSearch({
  fields: ["value"],
  storeFields: ["type", "freq"],
  tokenize: (string, _fieldName) => {
    //console.log(string);
    return [string];
  },
  processTerm: (term, _fieldName) => term.replace(/[\s-]/g, "").toLowerCase(),
  searchOptions: {
    //boost: { title: 2 },
    prefix: true,
    fuzzy: 0.25,
    processTerm: (term) => term.replace(/[\s-]/g, "").toLowerCase(),
    tokenize: (string) => [string], //.split(/[\s-]+/), // search query tokenizer
  },
});

// Index all documents
miniSearch.addAll(prenoms.map((p, i) => ({ type: "prenom", id: i + 1, ...p })));
miniSearch.addAll(noms.map((p, i) => ({ type: "nom", id: i + 1, ...p })));
miniSearch.addAll(villes.map((p, i) => ({ type: "ville", id: i + 1, ...p })));

const search = (term: string) => {
  const results = miniSearch.search(term, {});
  const type = results && results.length && results[0].type;
  console.log(term, type || "?");
};

// search("Julien");
// search("céline");
// search("jean louis");
// search("CELINE");
// search("MOHAMMA");
// search("Christo");
// search("De la tour");
// search("Christophe");
// search("Anto-Nio");
// search("Sainte marie de la mer");
// search("Paris");
// search("Sens");
// search("SAINTMARTIN AUXIGNY");
search("SAINT-ETIENNE");
search("SAINT ETIENNE");

//console.log(miniSearch.toJSON());
