import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/")({
  head: () => heads.home("uk"),
  component: Home,
});
