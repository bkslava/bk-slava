import { createFileRoute } from "@tanstack/react-router";
import { About } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/pro-kompaniyu")({
  head: () => heads.about("uk"),
  component: About,
});
