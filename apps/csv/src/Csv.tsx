import { useState, useCallback } from "react";
import { Button, ProgressBar, Alert } from "react-bootstrap";
import fileReaderStream from "filereader-stream";
import { saveAs } from "file-saver";
import concat from "concat-stream";
//import { SpinnerCircular } from "spinners-react";
import Loader from "react-ts-loaders";

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
    const outFileName = filereader.name.replace(
      /^(.*)\.csv$/,
      "$1-anonymify.csv"
    );
    const stream = fileReaderStream(filereader);
    stream.read(0);

    const outStream = anonymify(stream, {
      onProgress: console.log,
      columns,
    });

    outStream.pipe(
      concat(function (contents) {
        const url = URL.createObjectURL(new Blob(["\uFEFF" + contents]));
        saveAs(url, outFileName);
        resolve(true);
      })
    );
  });
};

const StatusPanel = ({ children, variant = "danger" }) => (
  <Alert style={{ fontSize: "1.5em" }} variant={variant}>
    {children}
  </Alert>
);

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
      style={{ height: 50, fontSize: "inherit" }}
    />
  )) || <div>Analyse en cours...</div>;

  const onExport = async () => {
    setExporting(true);
    setProgress({
      status: "finished",
      msg: `Anonymisation en cours ☕️`,
    });
    setTimeout(async () => {
      await anonymiseAndExport(
        filereader,
        columnsOptions.filter((col) => col.anonymise === true)
      );
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

  if (progress === null || isError) {
    return (
      <div>
        {isError && (
          <StatusPanel variant="danger">
            {progress.msg || progress.status}
          </StatusPanel>
        )}
        <CsvDropZone onDrop={onDrop} />
      </div>
    );
  }

  return (
    <div>
      {isFinished && <CsvDropZone onDrop={onDrop} />}
      <StatusPanel variant={isFinished ? "success" : "warning"}>
        {isFinished ? progress.msg || "Analyse terminée" : progressBar}
      </StatusPanel>
      {(records && records.length && (
        <div>
          <CsvPreviewTable
            records={records}
            samples={samples}
            onColumnChange={onColumnChange}
          />
          {isFinished && (
            <div>
              {exporting && (
                <div style={{ opacity: 0.5 }}>
                  <Loader size={300} type="hourglass" color="var(--bs-info)" />
                </div>
              )}
              <Alert variant={"info"}>
                <Button size="lg" onClick={onExport} disabled={exporting}>
                  Anonymiser et télécharger
                </Button>
              </Alert>
            </div>
          )}
        </div>
      )) ||
        null}
    </div>
  );
};
