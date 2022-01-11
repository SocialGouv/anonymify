import fileReaderStream from "filereader-stream";
import { anonymify, AnonymiseColumnOptions } from "@socialgouv/csv-anonymify";

export const anonymiseAndExport = async (
  filereader,
  columns: AnonymiseColumnOptions
) => {
  // require is needed to allow the mitm override
  const streamSaver = require("streamsaver");
  const webWorkerUrl = document.location.href + "/mitm.html";
  streamSaver.mitm = webWorkerUrl;

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
      console.log("error", data);
      defaultWriter.close();
      reject(true);
    });
  });
};
