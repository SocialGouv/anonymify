import { promises as fs } from "fs";

import { sample } from "../index";

test("should analyse sample.csv", async () => {
  const readStream = await fs.readFile(`./sample.csv`);

  const samples = await sample(readStream, { onProgress: console.log });

  expect(samples).toMatchSnapshot();
});
