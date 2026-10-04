import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("en", "gipsokarton");
export const Route = createFileRoute("/en/poslugy/gipsokarton")({
  head: () => heads.service("en", "gipsokarton"),
  component: () => <ServicePage service={service} />,
});
