import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/poslugy/")({
  head: () => heads.services("uk"),
  component: ServicesPage,
});
