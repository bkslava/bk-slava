import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("en", "steli");
export const Route = createFileRoute("/en/poslugy/steli")({
  head: () => heads.service("en", "steli"),
  component: () => <ServicePage service={service} />,
});
