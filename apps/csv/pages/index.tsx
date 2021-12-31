import { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Container, Alert, Table } from "react-bootstrap";

import { sample } from "@socialgouv/csv-sample";

import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./custom.module.css";

const uniq = (arr: any[]) => Array.from(new Set(arr));

const ellipsify = (str: string, maxLength: 15) =>
  str && str.length > maxLength
    ? str.substring(0, maxLength) + "..."
    : str || "";

const CSVDropZone = () => {
  const [progress, setProgress] = useState(null);
  const [records, setRecords] = useState(null);
  const [samples, setSamples] = useState(null);

  const reset = () => {
    setRecords([]);
    setSamples([]);
  };

  const onDrop = useCallback((acceptedFiles) => {
    reset();
    setProgress({
      status: "running",
      msg: "Démarrage...",
    });
    setTimeout(() => {
      const firstCSV = acceptedFiles[0];
      const reader = new FileReader();
      reader.onabort = () => {
        console.error("file reading was aborted");
        setProgress({
          status: "error",
          msg: "Impossible de lire le CSV : aborted",
        });
        reset();
      };
      reader.onerror = (e) => {
        console.error("file reading has failed", e);
        setProgress({
          status: "error",
          msg: `Impossible de lire le CSV : error`,
        });
        reset();
      };
      reader.onload = async (e) => {
        //@ts-expect-error
        sample(Buffer.from(e.target.result), {
          onProgress: ({ status, msg, records }) => {
            console.log({ status, msg, records });
            setProgress({ status, msg });
            if (records) {
              setRecords(records);
            }
          },
        })
          .then((samples) => {
            console.log("samples", samples);
            setSamples(samples);
          })
          .catch((e) => {
            console.error(e);
            setProgress({
              status: "error",
              msg: `Impossible de lire le CSV : error`,
            });
            reset();
            throw e;
          });
      };
      reader.readAsArrayBuffer(firstCSV);
    });
  }, []);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: "text/csv",
  });

  const acceptStyle = {
    borderColor: "#00e676",
  };

  const rejectStyle = {
    borderColor: "#ff1744",
  };

  const style = useMemo(
    () => ({
      ...(isDragActive ? acceptStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  const dropper = (
    <div {...getRootProps({ style })} className={styles.dropZone}>
      <input {...getInputProps()} />
      {<p>Glissez un fichier CSV ici</p>}
    </div>
  );

  return (
    <div>
      {progress === null || progress.status === "error" ? (
        <div>
          {progress && progress.status === "error" && (
            <Alert variant="danger">{progress.msg || progress.status}</Alert>
          )}
          {dropper}
        </div>
      ) : (
        <div>
          {progress && progress.status === "finished" && dropper}
          {progress && (
            <Alert
              variant={
                progress && progress.status === "finished"
                  ? "success"
                  : "warning"
              }
            >
              {progress.msg || progress.status}
            </Alert>
          )}

          {(records && records.length && (
            <CsvTable records={records} samples={samples} />
          )) ||
            null}
        </div>
      )}
    </div>
  );
};

const getColumnSamplesValues = ({ records, key, columnType }) => {
  const values =
    columnType === "empty"
      ? ""
      : columnType === "fixed"
      ? records[0][key]
      : uniq(records.map((rec) => ellipsify(rec[key], 15)).filter((x) => !!x))
          .slice(0, 3)
          .join(", ");
  return values;
};

const CsvTable = ({ samples, records }) => {
  const columns = records && records.length && Object.keys(records[0]);
  return (
    <Table striped bordered hover style={{ fontSize: "0.8em" }}>
      <thead>
        <tr>
          <th>Colonne</th>
          <th>Type détecté</th>
          <th>Anonymiser</th>
          <th>Exemples</th>
        </tr>
      </thead>
      <tbody>
        {columns.map((key) => {
          const columnType =
            samples.length && samples.find((s) => s.name === key)?.type;
          const values = getColumnSamplesValues({ records, key, columnType });
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>{columnType || "-"}</td>
              <td>
                <input
                  type="checkbox"
                  defaultChecked={columnType !== "empty"}
                />
              </td>
              <td>{values}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default function CSV() {
  return (
    <Container>
      <div
        style={{
          textAlign: "center",
          fontFamily: "Trebuchet Ms, Verdana",
          paddingTop: 20,
        }}
      >
        <Alert>
          <h1>Anonymisation de CSV</h1>
          <p>Anonymisez vos données sans les transmettre</p>
        </Alert>
        <CSVDropZone />
      </div>
    </Container>
  );
}
