import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/pryvatnist")({
  head: () => heads.privacy("uk"),
  component: Privacy,
});
