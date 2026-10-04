import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/en/")({
  head: () => heads.home("en"),
  component: Home,
});
