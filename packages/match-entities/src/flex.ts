import FlexSearch, { Index, Document } from "flexsearch";

//const index = new Index();

console.log(FlexSearch);
const index1 = new Index({
  preset: "score",
  charset: "latin",
  language: "fr",
  tokenize: "full",
  encode: "advanced",
  cache: true,
  //   document: {
  //     id: "id",
  //     index: ["value"],
  //   },
});

const index = new Document({
  preset: "match",
  charset: "latin",
  language: "fr",
  tokenize: "full",
  resolution: 25,
  encode: "advanced",
  //cache: true,
  boost: (arr, str, int) => {
    console.log("boost", arr, str, int);
    return int;
  },
  document: {
    id: "id",
    index: ["value"],
    store: ["freq"],
  },
});

index.add({
  id: 0,
  value: "un peu de text",
  freq: 1,
});

index.add({
  id: 1,
  value: "un autre texte",
  freq: 2,
});

index.add({
  id: 2,
  value: "ici on parle de banane",
  freq: 2,
});

index.add({
  id: 3,
  value: "un autre texte qui parle de fruits",
  freq: 2,
});

// index.searchAsync("text", { enrich: true }).then(console.log);
// index.searchAsync("banne", { enrich: true }).then(console.log);

const search = (term: string) => {
  index
    .searchAsync(term, { enrich: true })
    .then((res) => console.log(term, JSON.stringify(res, null, 2)));
};

console.log("io");

search("juju");
search("textes");
search("banane");

// const index = new FlexSearch({
//   tokenize: function (str) {
//     return str.split(/\s-\//g);
//   },
// });

// const doc = new Document({
//   tags: ["tag", "name", "title", "text"],
//   worker: true,
// });

// index
//   .add({
//     id: 1,
//     tag: "cat",
//     name: "Tom",
//     title: "some",
//     text: "some",
//   })
//   .add({
//     id: 2,
//     tag: "dog",
//     name: "Ben",
//     title: "title",
//     text: "content",
//   })
//   .add({
//     id: 3,
//     tag: "cat",
//     name: "Max",
//     title: "to",
//     text: "to",
//   })
//   .add({
//     id: 4,
//     tag: "dog",
//     name: "Tim",
//     title: "index",
//     text: "index",
//   });
