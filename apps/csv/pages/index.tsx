import { useState, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Container, Alert, Table } from "react-bootstrap";

import { sample } from "@socialgouv/csv-sample";

import "bootstrap/dist/css/bootstrap.min.css";

const dropzoneStyle = {
  flex: 1,
  display: "flex",
  "flex-direction": "column",
  alignItems: "center",
  padding: 50,
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const uniq = (arr: any[]) => Array.from(new Set(arr));
const ellipsify = (str: string, maxLength: 15) =>
  str && str.length > maxLength
    ? str.substring(0, maxLength) + "..."
    : str || "";

const DropZone = () => {
  const [status, setStatus] = useState(null);
  const [records, setRecords] = useState(null);
  const [samples, setSamples] = useState(null);
  const onDrop = useCallback((acceptedFiles) => {
    setStatus(null);
    setRecords([]);
    setSamples([]);
    acceptedFiles.forEach(async (file) => {
      //const reader2 = await file.stream();
      ``;
      //sample(reader2).then(console.log).catch(console.log);

      const reader = new FileReader();

      //  console.log(fileContentStream);

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = async (e) => {
        //@ts-expect-error
        sample(new Buffer(e.target.result), {
          onProgress: ({ status, msg, records }) => {
            console.log({ status, msg, records });
            setStatus(msg);
            if (records) {
              setRecords(records);
            }
          },
        })
          .then((samples) => {
            console.log("samples", samples);
            setSamples(samples);
          })
          .catch(console.log);
      };
      console.log(reader);

      reader.readAsArrayBuffer(file);
    });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "text/csv",
  });

  const columns = records && records.length && Object.keys(records[0]);

  return (
    <div {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      {status ? status : <p>Glissez un fichier CSV ici</p>}
      {(records && records.length && (
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
              const values =
                columnType === "empty"
                  ? ""
                  : columnType === "fixed"
                  ? records[0][key]
                  : uniq(
                      records
                        .map((rec) => ellipsify(rec[key], 15))
                        .filter((x) => !!x)
                    )
                      .slice(0, 3)
                      .join(", ");
              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{columnType || "-"}</td>
                  <td>
                    <input type="checkbox" checked={columnType !== "empty"} />
                  </td>
                  <td>{values}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )) ||
        null}
    </div>
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
          <h1>CSV anonymiser</h1>
        </Alert>
        <DropZone />
      </div>
    </Container>
  );
}
