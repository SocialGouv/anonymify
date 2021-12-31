import fuzzball from "fuzzball";
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

        const dedupeOptions = { cutoff: 85, scorer: fuzzball.ratio };
        const duplicates = relevantRecords.map(([nom, count]) => nom);

        const uniques = fuzzball
          .dedupe(duplicates, dedupeOptions)
          .map(([a, b]) => a);

        const counts = relevantRecords
          .filter(([a, b]) => uniques.indexOf(a) > -1)
          .map(([_, count]) => parseInt(count))
          .sort((a, b) => parseInt(a) - parseInt(b))
          .reverse();

        const maxCount = counts[0];

        const recordsWithFrequency = relevantRecords
          .filter(([a, b]) => uniques.indexOf(a) > -1)
          .map(([value, count]) => ({
            value,
            freq: parseInt(count) / maxCount,
          }));

        resolve(recordsWithFrequency);
      }
    )
  );

getRecords()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch(console.log);
