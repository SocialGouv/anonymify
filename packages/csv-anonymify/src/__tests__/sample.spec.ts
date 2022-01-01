import fs from "fs";

import { anonymify } from "../index";

test("should analyse sample.csv", async () => {
  const readStream = fs.createReadStream(`./sample.csv`);

  const samples = await anonymify(readStream, { onProgress: console.log });

  expect(samples).toMatchSnapshot();
});
