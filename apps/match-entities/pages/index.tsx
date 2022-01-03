import { match } from "@socialgouv/match-entities";
import { KeyboardEvent, useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

export default function Web() {
  const [predictions, setPredictions] = useState(null);
  const [query, setQuery] = useState("Ville franche / saone");
  const [queryValue] = useDebounce(query, 300);

  const onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
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
      match(queryValue).then((predictions) => {
        setPredictions(predictions);
      });
    }
  }, [queryValue]);

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "Trebuchet Ms, Verdana",
      }}
    >
      <h1>Détection d&apos;entités FR</h1>
      <input
        defaultValue={query}
        style={{ fontSize: 42, textAlign: "center", width: 500 }}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyUp}
      />
      <br />
      <br />
      {predictions &&
        predictions.map((prediction, idx) => (
          <div style={{ fontSize: "1.4em" }} key={prediction.type}>
            {idx === 0 ? <b>{prediction.type}</b> : prediction.type} (
            {prediction.score})
          </div>
        ))}
    </div>
  );
}
