import fuzzball from "fuzzball";
import fs from "fs";
import { parse } from "csv-parse";

const csvContent = fs.readFileSync(`./data/villes.csv`).toString();

// Code INSEE;Code Postal; Commune; Département; Région; Statut;Altitude Moyenne; Superficie; Population; geo_point_2d; geo_shape;ID Geofla;Code Commune;Code Canton;Code Arrondissement;Code Département;Code Région
// insee,
// extract most relevant names and adds frequency hint
const getRecords = () =>
  new Promise((resolve, reject) =>
    parse(
      csvContent,
      {
        delimiter: ";",
        from_line: 2,
        skip_empty_lines: true,
      },
      function (err, records) {
        if (err) {
          return reject(err);
        }

        const groupResults = (ville) => {
          const re = new RegExp(`^${ville}-.*-ARRONDISSEMENT$`);
          const villeRecords = records.filter((cells) => cells[2].match(re));
          return [
            null,
            null,
            ville,
            null,
            null,
            null,
            null,
            null,
            villeRecords.reduce((a, c) => a + parseInt(c[8]), 0),
          ];
        };

        // only keep records with population > 1000
        const relevantRecords = records
          .filter((cells) => parseInt(cells[8]) > 1)
          .filter((cells) => !cells[2].match(/arrondissement/i));

        // add fake result to group by arrondissement;
        relevantRecords.push(groupResults("PARIS"));
        relevantRecords.push(groupResults("MARSEILLE"));
        relevantRecords.push(groupResults("LYON"));

        const dedupeOptions = { cutoff: 85, scorer: fuzzball.ratio };
        const duplicates = relevantRecords.map((cells) => cells[2]);

        const uniques = fuzzball
          .dedupe(duplicates, dedupeOptions)
          .map(([a, b]) => a);

        const counts = relevantRecords
          .filter((cells) => uniques.indexOf(cells[2]) > -1)
          .map((cells) => parseInt(cells[8]))
          .sort((a, b) => parseInt(a) - parseInt(b))
          .reverse();

        const maxCount = counts[0];

        const recordsWithFrequency = relevantRecords
          .filter((cells) => uniques.indexOf(cells[2]) > -1)
          .map((cells) => ({
            value: cells[2],
            freq: parseInt(cells[8]) / maxCount,
          }));

        resolve(recordsWithFrequency);
      }
    )
  );

getRecords()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch(console.log);
