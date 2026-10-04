import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("uk", "santehnika-elektryka");
export const Route = createFileRoute("/poslugy/santehnika-elektryka")({
  head: () => heads.service("uk", "santehnika-elektryka"),
  component: () => <ServicePage service={service} />,
});
