import { ColumnOption } from "csv-parse/.";
import fs from "fs";

import { anonymify, AnonymiseColumnOptions } from "../index";

test("should analyse sample.csv", async () => {
  const readStream = fs.createReadStream(`./sample.csv`);

  const columns = [
    { name: "civilite", type: "sex" },
    { name: "column_9", type: "city" },
    { name: "column_10", type: "phone" },
  ] as AnonymiseColumnOptions;

  const outStream = await anonymify(readStream, {
    columns,
    onProgress: console.log,
  });

  return new Promise((resolve, reject) => {
    let bytes = Buffer.from("");

    outStream.on("data", (chunk) => {
      bytes = Buffer.concat([bytes, chunk]);
    });

    outStream.on("end", () => {
      try {
        expect(bytes.toString()).toMatchSnapshot();
        resolve(true);
      } catch (err) {
        reject();
      }
    });
  });
});