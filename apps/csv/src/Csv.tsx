import { useState, useCallback } from "react";
import { Button, ProgressBar, Alert } from "react-bootstrap";
import fileReaderStream from "filereader-stream";
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
  return new Promise(async (resolve, reject) => {
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

    const streamSaver = await import("streamsaver");

    const fileStream = streamSaver.createWriteStream(outFileName, {});

    const defaultWriter = fileStream.getWriter();

    outStream.on("readable", function () {
      let row;
      while ((row = outStream.read()) !== null) {
        defaultWriter.write(Buffer.from(row));
      }
    });

    outStream.on("end", (data) => {
      defaultWriter.close();
      resolve(true);
    });

    outStream.on("error", (data) => {
      defaultWriter.close();
      reject(true);
    });
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
          msg: `Impossible de lire le CSV : ${e}`,
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
    setTimeout(async () => {
      try {
        await anonymiseAndExport(
          filereader,
          columnsOptions.filter((col) => col.anonymise === true)
        );
        setProgress({
          status: "finished",
          msg: `Anonymisation terminée 🎉`,
        });
        setExporting(false);
      } catch (e) {
        setProgress({
          status: "error",
          msg: `Impossible d'exporter : ${e.message}`,
        });
        setExporting(false);
      }
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
