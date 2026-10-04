import { createFileRoute } from "@tanstack/react-router";
import { Contacts } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/kontakty")({
  head: () => heads.contacts("uk"),
  component: Contacts,
});
