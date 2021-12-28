import fs from "fs";
import { parse } from "csv-parse";

const csvContent = fs.readFileSync(`./data/noms.csv`).toString();

// extract most relevant names and adds frequency hint
const getRecords = () =>
  new Promise((resolve, reject) =>
    parse(
      csvContent,
      {
        trim: true,
        from_line: 2,
        skip_empty_lines: true,
      },
      function (err, records) {
        if (err) {
          return reject(err);
        }

        // only keep records with count>100
        const relevantRecords = records.filter(
          ([_, count]) => parseInt(count) > 100
        );

        const counts = relevantRecords
          .map(([_, count]) => parseInt(count))
          .sort((a, b) => parseInt(a) - parseInt(b))
          .reverse();

        const maxCount = counts[0];

        const recordsWithFrequency = relevantRecords.map(([value, count]) => ({
          value,
          freq: parseInt(count) / maxCount,
        }));

        resolve(recordsWithFrequency);
      }
    )
  );

getRecords()
  .then((data) => console.log(JSON.stringify(data)))
  .catch(console.log);
