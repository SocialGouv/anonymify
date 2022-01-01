import { Table } from "react-bootstrap";

import { getColumnSampleValues } from "./utils";

type CsvTableParams = {
  samples: ColumnSample[];
  records: Record<string, string>[];
};

export const CsvPreviewTable = ({ samples, records }: CsvTableParams) => {
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
          const values = getColumnSampleValues({ records, key, columnType });
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
