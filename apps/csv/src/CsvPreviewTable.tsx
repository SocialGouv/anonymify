import { Table, Form } from "react-bootstrap";

import { getColumnSampleValues } from "./utils";

type CsvTableParams = {
  samples: ColumnSample[];
  records: Record<string, string>[];
  onColumnChange: Function;
};

const dataTypes = [
  "nom",
  "prenom",
  "fullname",
  "adresse",
  "text",
  "email",
  "integer",
  "float",
  "geo",
  "url",
  "tel",
  "date",
  "date_fr",
  "datetime",
  "siret",
  "siren",
  "json",
];

export const CsvPreviewTable = ({
  samples,
  records,
  onColumnChange,
}: CsvTableParams) => {
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
          <th>Type</th>
          <th style={{ textAlign: "center" }}>Anonymiser</th>
          <th>Exemples</th>
        </tr>
      </thead>
      <tbody>
        {columns.map((key) => {
          const columnType =
            samples &&
            samples.length &&
            samples.find((s) => s.name === key)?.type;
          const values = getColumnSampleValues({ records, key, columnType });
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>
                <Form.Select
                  onChange={(e) =>
                    onColumnChange(key, { type: e.currentTarget.value })
                  }
                >
                  <option>--</option>
                  {dataTypes.map((type) => (
                    <option key={type} selected={columnType === type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td style={{ textAlign: "center" }}>
                <Form.Check
                  defaultChecked={columnType !== "empty"}
                  onClick={(e) => {
                    onColumnChange(key, { anonymise: e.currentTarget.checked });
                  }}
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
