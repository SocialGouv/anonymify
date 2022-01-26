import fileReaderStream from "filereader-stream";
import { anonymify, AnonymiseColumnOptions } from "@socialgouv/csv-anonymify";
import { getDelimiter } from "@socialgouv/csv-sample";
import * as ponyfill from "web-streams-polyfill/ponyfill"; // for firefox

export const anonymiseAndExport = async (
  file: File,
  buffer: Buffer,
  columns: AnonymiseColumnOptions
) => {
  // require is needed to allow the mitm override
  const streamSaver = require("streamsaver");
  streamSaver.WritableStream = ponyfill.WritableStream;
  const webWorkerUrl = document.location.href + "/mitm.html";
  streamSaver.mitm = webWorkerUrl;

  return new Promise(async (resolve, reject) => {
    const outFileName = file.name.replace(/^(.*)\.csv$/, "$1-anonymify.csv");
    const stream = fileReaderStream(file);
    stream.read(0);

    const delimiter = await getDelimiter(buffer);

    stream.read(0);

    const outStream = anonymify(stream, {
      onProgress: console.log,
      columns,
      delimiter,
    });

    console.log("outStream", outStream);

    const fileStream = streamSaver.createWriteStream(outFileName, {});

    const defaultWriter = fileStream.getWriter();

    outStream.on("readable", function () {
      let row;
      try {
        while ((row = outStream.read()) !== null) {
          defaultWriter.write(Buffer.from(row));
        }
      } catch (e) {
        console.log("parser error", e);
        throw e;
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
