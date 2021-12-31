import { match } from "./src/index";

(async () => {
  match("juju").then(console.log).catch(console.log);
})();
