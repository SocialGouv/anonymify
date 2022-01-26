import { useState, useCallback } from "react";
import { Button, ProgressBar, Alert } from "react-bootstrap";
import Loader from "react-ts-loaders";

import { sample } from "@socialgouv/csv-sample";

import { CsvPreviewTable } from "./CsvPreviewTable";
import { CsvDropZone } from "./CsvDropZone";
import { replaceItemInArray } from "./utils";
import { anonymiseAndExport } from "./anonymiseAndExport";

const StatusPanel = ({ children, variant = "danger" }) => (
  <Alert style={{ fontSize: "1.5em" }} variant={variant}>
    {children}
  </Alert>
);

const ExportZone = ({ onExport, isExporting }) => (
  <div>
    {isExporting && (
      <div style={{ opacity: 0.5 }}>
        <Loader size={300} type="grid" color="var(--bs-info)" />
      </div>
    )}
    <Alert variant={"info"}>
      <Button size="lg" onClick={onExport} disabled={isExporting}>
        Anonymiser et télécharger
      </Button>
    </Alert>
  </div>
);

export const Csv = () => {
  const [progress, setProgress] = useState(null);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [records, setRecords] = useState(null);
  const [samples, setSamples] = useState(null);
  const [file, setFile] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [columnsOptions, setColumnsOptions] = useState(null);
  const [exporting, setExporting] = useState(null);

  const reset = () => {
    setRecords(null);
    setSamples(null);
    setDetectionProgress(0);
    setFile(null);
    setBuffer(null);
    setColumnsOptions(null);
    setExporting(null);
  };

  const onDrop = useCallback((acceptedFiles) => {
    reset();
    if (acceptedFiles.length) {
      setProgress({
        status: "running",
        msg: "Démarrage...",
      });
      const reader = new FileReader();

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
            msg: `Impossible de lire le CSV : ${e}`,
          });
          reset();
        };
        reader.onload = async (e) => {
          let detectionLength;
          let detectProgress = 0;
          //@ts-expect-error
          const resultBuffer = Buffer.from(e.target.result);
          setBuffer(resultBuffer);
          sample(resultBuffer, {
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
              setColumnsOptions(
                samples.map((sample) => ({
                  name: sample.name,
                  type: sample.type,
                  metadata: sample.metadata,
                  anonymise: true,
                }))
              );
            })
            .catch((e) => {
              console.error(e);
              setProgress({
                status: "error",
                msg: `Impossible de lire le CSV : ${e.message}`,
              });
              reset();
              throw e;
            });
        };
        reader.readAsArrayBuffer(firstCSV);
      });
    } else {
      setProgress({
        status: "error",
        msg: `Aucun fichier CSV détecté`,
      });
      reset();
    }
  }, []);

  const progressBar = (detectionProgress && (
    <ProgressBar
      now={detectionProgress * 100}
      animated
      label={`Analyse : ${Math.round(detectionProgress * 100)}%`}
      style={{ height: 50, fontSize: "inherit" }}
    />
  )) || <div>Analyse en cours...</div>;

  const onExport = async () => {
    setExporting(true);
    setProgress({
      status: "finished",
      msg: `Anonymisation en cours ☕️`,
    });
    console.log("columnsOptions", columnsOptions);
    // wait a while for css loader to kickin
    setTimeout(async () => {
      await anonymiseAndExport(
        file,
        buffer,
        columnsOptions.filter((col) => col.anonymise === true)
      ).catch((e) => {
        console.log("anonymiseAndExport error", e);
        setProgress({
          status: "error",
          msg: `🥲 Impossible d'exporter : ${e.message}`,
        });
        setExporting(false);
        throw e;
      });
      setProgress({
        status: "finished",
        msg: `Anonymisation terminée 🎉`,
      });
      setExporting(false);
    }, 50);
  };

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

  const isFinished = progress && progress.status === "finished";
  const isError = progress && progress.status === "error";

  const recordsView =
    (records && records.length && (
      <div>
        {!exporting && (
          <CsvPreviewTable
            records={records}
            samples={samples}
            onColumnChange={onColumnChange}
          />
        )}
        {isFinished && (
          <ExportZone onExport={onExport} isExporting={exporting} />
        )}
      </div>
    )) ||
    null;

  if (progress === null || isError) {
    return (
      <div>
        {isError && (
          <StatusPanel variant="danger">
            {progress.msg || progress.status}
          </StatusPanel>
        )}
        <CsvDropZone onDrop={onDrop} />
        {recordsView}
        <ExportZone onExport={onExport} isExporting={exporting} />
      </div>
    );
  }

  return (
    <div>
      {isFinished && <CsvDropZone onDrop={onDrop} />}
      <StatusPanel variant={isFinished ? "success" : "warning"}>
        {isFinished ? progress.msg || "Analyse terminée" : progressBar}
      </StatusPanel>
      {recordsView}
    </div>
  );
};
