import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("uk", "demontazh");
export const Route = createFileRoute("/poslugy/demontazh")({
  head: () => heads.service("uk", "demontazh"),
  component: () => <ServicePage service={service} />,
});
