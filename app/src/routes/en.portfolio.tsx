import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/en/portfolio")({
  head: () => heads.portfolio("en"),
  component: Portfolio,
});
