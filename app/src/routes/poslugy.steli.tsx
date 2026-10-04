import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("uk", "steli");
export const Route = createFileRoute("/poslugy/steli")({
  head: () => heads.service("uk", "steli"),
  component: () => <ServicePage service={service} />,
});
