import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("en", "demontazh");
export const Route = createFileRoute("/en/poslugy/demontazh")({
  head: () => heads.service("en", "demontazh"),
  component: () => <ServicePage service={service} />,
});
