import { defineApp } from "kitshn";

export default defineApp({
  compose: { runsOn: ["docker", "server"], file: "compose.yml" },
  deploy: [
    {
      on: "push",
      branch: "main",
      name: "prod",
      address: "atuin.yarden-zamir.com",
      startsIn: "Machines",
    },
  ],
});
