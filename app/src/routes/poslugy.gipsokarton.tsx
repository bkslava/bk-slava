import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("uk", "gipsokarton");
export const Route = createFileRoute("/poslugy/gipsokarton")({
  head: () => heads.service("uk", "gipsokarton"),
  component: () => <ServicePage service={service} />,
});
