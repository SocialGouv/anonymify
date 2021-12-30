import fs from "fs";

import { sample } from "../index";

test("should analyse sample.csv", async () => {
  const readStream = fs.createReadStream(`./sample.csv`);

  const samples = await sample(readStream, { onProgress: console.log });

  expect(samples).toMatchSnapshot();
});
