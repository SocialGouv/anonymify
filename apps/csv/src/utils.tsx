import { CSSProperties } from "react";

const uniq = (arr: any[]) => Array.from(new Set(arr));

const ellipsify = (str: string, maxLength: number = 15) => {
  if (!str) return "";
  if (str.length > maxLength) return str.substring(0, maxLength) + "...";
  return str;
};

type GetColumnSampleValuesParams = {
  key: string;
  columnType: string;
  records: Record<string, string>[];
};

const styleTextEllipsis = {
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
} as CSSProperties;

export const replaceItemInArray = (arr: any[], index: number, item) => [
  ...arr.slice(0, index),
  item,
  ...arr.slice(index + 1),
];

export const getColumnSampleValues = ({
  records,
  key,
  columnType,
}: GetColumnSampleValuesParams) => {
  const maxLength = 30;
  const values = uniq(
    columnType === "empty"
      ? []
      : columnType === "fixed"
      ? [records[0][key]]
      : records
          .map((rec) => rec[key])
          .filter((x) => !!x)
          .slice(0, 10)
  );
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
