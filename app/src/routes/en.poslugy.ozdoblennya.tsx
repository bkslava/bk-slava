import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("en", "ozdoblennya");
export const Route = createFileRoute("/en/poslugy/ozdoblennya")({
  head: () => heads.service("en", "ozdoblennya"),
  component: () => <ServicePage service={service} />,
});
