import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/en/poslugy/")({
  head: () => heads.services("en"),
  component: ServicesPage,
});
