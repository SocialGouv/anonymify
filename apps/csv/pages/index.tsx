import { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Button, ProgressBar, Container, Alert, Table } from "react-bootstrap";
import GitHubForkRibbon from "react-github-fork-ribbon";
import Head from "next/head";
import fileReaderStream from "filereader-stream";
import { saveAs } from "file-saver";
import concat from "concat-stream";

import { sample } from "@socialgouv/csv-sample";
import { anonymify } from "@socialgouv/csv-anonymify";

import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./custom.module.css";

const uniq = (arr: any[]) => Array.from(new Set(arr));

const ellipsify = (str: string, maxLength: number = 15) => {
  if (!str) return "";
  if (str.length > maxLength) return str.substring(0, maxLength) + "...";
  return str;
};

const CSVDropZone = () => {
  const [progress, setProgress] = useState(null);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [records, setRecords] = useState(null);
  const [samples, setSamples] = useState(null);
  const [file, setFile] = useState(null);

  const reset = () => {
    setRecords([]);
    setSamples([]);
    setDetectionProgress(0);
    setFile(null);
  };

  const onDrop = useCallback((acceptedFiles) => {
    reset();
    setProgress({
      status: "running",
      msg: "Démarrage...",
    });
    const reader = new FileReader();
    //setReaderStream(reader);
    setTimeout(() => {
      const firstCSV = acceptedFiles[0];
      setFile(firstCSV);
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
        let detectionLength;
        let detectProgress = 0;
        //@ts-expect-error
        sample(Buffer.from(e.target.result), {
          onProgress: ({ status, msg, records }) => {
            if (status === "samples") {
              detectionLength = Object.keys(records[0]).length;
            }
            if (detectionLength && status === "detect") {
              detectProgress += 1;
              setDetectionProgress(detectProgress / detectionLength);
            }
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

  const progressBar = (detectionProgress && (
    <ProgressBar
      now={detectionProgress * 100}
      animated
      label={`Analyse : ${Math.round(detectionProgress * 100)}%`}
    />
  )) || <div>Analyse en cours...</div>;

  const onExport = async () => {
    const stream = fileReaderStream(file);

    const outStream = anonymify(stream, {
      onProgress: console.log,
      columns: [{ name: "nofinesset", type: "email" }],
    });

    outStream.pipe(
      concat(function (contents) {
        const url = URL.createObjectURL(new Blob(["\uFEFF" + contents]));
        saveAs(url);
      })
    );
  };

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
              {(progress.status !== "finished" && progressBar) ||
                "Analyse terminée"}
            </Alert>
          )}

          {(records && records.length && (
            <div>
              <CsvTable records={records} samples={samples} />
              {progress && (
                <Alert
                  variant={progress.status === "finished" ? "success" : "info"}
                >
                  <Button
                    disabled={progress.status !== "finished"}
                    size="lg"
                    onClick={onExport}
                  >
                    Anonymiser et télécharger
                  </Button>{" "}
                </Alert>
              )}
            </div>
          )) ||
            null}
        </div>
      )}
    </div>
  );
};

const styleTextEllipsis = {
  textOverflow: "ellispis",
  "white-space": "nowrap",
  overflow: "hidden ",
};

const getColumnSamplesValues = ({ records, key, columnType }) => {
  const maxLength = 30;
  const values =
    columnType === "empty"
      ? ""
      : columnType === "fixed"
      ? records[0][key]
      : uniq(records)
          .map((rec) => rec[key])
          .filter((x) => !!x)
          .slice(0, 10);
  return (
    <div title={values && values.join("\n")} style={styleTextEllipsis}>
      {values &&
        values
          .slice(0, 3)
          .map((value) => ellipsify(value, maxLength))
          .join(", ")}
    </div>
  );
};

const CsvTable = ({ samples, records }) => {
  const columns = records && records.length && Object.keys(records[0]);
  return (
    <Table
      striped
      bordered
      hover
      style={{ textAlign: "left", fontSize: "0.8em" }}
    >
      <thead>
        <tr>
          <th>Colonne</th>
          <th>Type détecté</th>
          <th style={{ textAlign: "center" }}>Anonymiser</th>
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
              <td style={{ textAlign: "center" }}>
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
      <Head>
        <title>Anonymisation CSV</title>
      </Head>
      <GitHubForkRibbon
        href="//github.com/socialgouv/anonymify"
        target="_blank"
        position="right"
      >
        Fork me on GitHub
      </GitHubForkRibbon>
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
