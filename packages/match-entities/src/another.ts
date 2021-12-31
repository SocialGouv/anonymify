//@ts-expect-error
import Wade from "wade";
Wade.config.processors = [];

import prenoms from "../data/prenoms.json";
const search = Wade(prenoms.map((p) => p.value));

console.log("Jul", search("Jul"));
console.log("Jean Louis", search("Jean Louis"));
