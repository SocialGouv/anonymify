import { useState, useCallback } from "react";
import { Button, ProgressBar, Alert } from "react-bootstrap";
import fileReaderStream from "filereader-stream";
import { saveAs } from "file-saver";
import concat from "concat-stream";

import { sample } from "@socialgouv/csv-sample";
import { anonymify, AnonymiseColumnOptions } from "@socialgouv/csv-anonymify";

import { CsvPreviewTable } from "./CsvPreviewTable";
import { CsvDropZone } from "./CsvDropZone";
import { replaceItemInArray } from "./utils";

const anonymiseAndExport = async (
  filereader,
  columns: AnonymiseColumnOptions
) => {
  return new Promise((resolve) => {
    const stream = fileReaderStream(filereader);
    stream.read(0);

    const outStream = anonymify(stream, {
      onProgress: console.log,
      columns,
    });

    outStream.pipe(
      concat(function (contents) {
        const url = URL.createObjectURL(new Blob(["\uFEFF" + contents]));
        saveAs(url, "anonymised.csv");
        resolve(true);
      })
    );
  });
};

export const Csv = () => {
  const [progress, setProgress] = useState(null);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [records, setRecords] = useState(null);
  const [samples, setSamples] = useState(null);
  const [filereader, setFileReader] = useState(null);
  const [columnsOptions, setColumnsOptions] = useState(null);
  const [exporting, setExporting] = useState(null);

  const reset = () => {
    setRecords(null);
    setSamples(null);
    setDetectionProgress(0);
    setFileReader(null);
    setColumnsOptions(null);
    setExporting(null);
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
      setFileReader(firstCSV);
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
            setSamples(samples);
            setColumnsOptions(
              samples.map((sample) => ({
                name: sample.name,
                type: sample.type,
                anonymise: true,
              }))
            );
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

  const progressBar = (detectionProgress && (
    <ProgressBar
      now={detectionProgress * 100}
      animated
      label={`Analyse : ${Math.round(detectionProgress * 100)}%`}
    />
  )) || <div>Analyse en cours...</div>;

  const onExport = async () => {
    setExporting(true);
    setTimeout(async () => {
      await anonymiseAndExport(
        filereader,
        columnsOptions.filter((col) => col.anonymise === true)
      );
      setExporting(false);
    });
  };

  if (progress === null || progress.status === "error") {
    return (
      <div>
        {progress && progress.status === "error" && (
          <Alert variant="danger">{progress.msg || progress.status}</Alert>
        )}
        <CsvDropZone onDrop={onDrop} />;
      </div>
    );
  }

  const isFinished = progress.status === "finished";

  const onColumnChange = (key, values = {}) => {
    const columnOptionIndex = columnsOptions.findIndex((c) => c.name === key);
    const newColumnOptions = replaceItemInArray(
      columnsOptions,
      columnOptionIndex,
      {
        ...columnsOptions[columnOptionIndex],
        ...values,
      }
    );
    setColumnsOptions(newColumnOptions);
  };

  return (
    <div>
      {isFinished && <CsvDropZone onDrop={onDrop} />}
      <Alert variant={isFinished ? "success" : "warning"}>
        {isFinished ? "Analyse terminée" : progressBar}
      </Alert>
      {(records && records.length && (
        <div>
          <CsvPreviewTable
            records={records}
            samples={samples}
            onColumnChange={onColumnChange}
          />
          {isFinished && (
            <Alert variant={"info"}>
              <Button size="lg" onClick={onExport} disabled={exporting}>
                Anonymiser et télécharger
              </Button>{" "}
            </Alert>
          )}
        </div>
      )) ||
        null}
    </div>
  );
};
