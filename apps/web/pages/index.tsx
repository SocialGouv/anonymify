import { Button } from "ui";
import { search } from "@socialgouv/match-french-entities";

console.log(search);

const searches = [
  "Julien",
  "Martin",
  "Céline",
  "Celine",
  "CELINE",
  "mont de marsan",
  "momo",
  "Larbi",
  "Leila",
  "Gus",
  "Henri de la tour",
  "de la verriere",
  "Emmanuel",
  "Catherine",
  "CATHERINE",
  "Pinard",
  "Pinardo",
  "bouquillon",
  "saint etienne",
  "sens",
  "pedro",
  "maalik",
  "anderson",
  "Rochefourchat",
  "Ornes",
  "villeneuve saint georges",
  "saint-clement",
];

export default function Web() {
  const onClick = () => {
    console.log("start", new Date());
    searches.forEach((query) => {
      search(query).then(({ type, score }) => {
        console.log(query, type, score);
      });
    });
  };
  return (
    <div>
      <h1>Web</h1>
      <Button onClick={onClick} />
    </div>
  );
}
