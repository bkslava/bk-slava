import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/en/pryvatnist")({
  head: () => heads.privacy("en"),
  component: Privacy,
});
