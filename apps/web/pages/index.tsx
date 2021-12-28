import { search } from "@socialgouv/match-french-entities";
import { KeyboardEvent, useState } from "react";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";

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
  const [predictions, setPredictions] = useState(null);
  const [query, setQuery] = useState("Ville franche / saone");
  const [queryValue] = useDebounce(query, 300);

  const onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log(e);
    if (!e.metaKey) {
      const newQuery = e.currentTarget.value.trim();
      if (newQuery !== query) {
        setPredictions(null);
        setQuery(newQuery);
      }
    }
  };

  useEffect(() => {
    if (queryValue) {
      search(queryValue).then((predictions) => {
        console.log("useEffect", queryValue, predictions);
        setPredictions(predictions);
      });
    }
  }, [queryValue]);

  return (
    <div
      style={{
        textAlign: "center",
        fontSize: "2em",
        fontFamily: "Trebuchet Ms, Verdana",
      }}
    >
      <h1>Détection d&apos;entités</h1>
      <input
        defaultValue={query}
        style={{ fontSize: 24, textAlign: "center", width: 500 }}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyUp}
      />
      <br />
      <br />
      {predictions &&
        predictions.map((prediction) => (
          <div style={{}} key={prediction.score}>
            {prediction.type} ({prediction.adjustedScore})
          </div>
        ))}
    </div>
  );
}
