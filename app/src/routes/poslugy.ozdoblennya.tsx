import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("uk", "ozdoblennya");
export const Route = createFileRoute("/poslugy/ozdoblennya")({
  head: () => heads.service("uk", "ozdoblennya"),
  component: () => <ServicePage service={service} />,
});
