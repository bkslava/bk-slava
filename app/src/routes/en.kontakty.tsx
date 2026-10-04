import { createFileRoute } from "@tanstack/react-router";
import { Contacts } from "../slava/site";
import { heads } from "../slava/heads";
export const Route = createFileRoute("/en/kontakty")({
  head: () => heads.contacts("en"),
  component: Contacts,
});
