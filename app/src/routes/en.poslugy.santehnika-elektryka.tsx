import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("en", "santehnika-elektryka");
export const Route = createFileRoute("/en/poslugy/santehnika-elektryka")({
  head: () => heads.service("en", "santehnika-elektryka"),
  component: () => <ServicePage service={service} />,
});
