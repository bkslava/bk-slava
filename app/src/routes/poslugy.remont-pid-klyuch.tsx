import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("uk", "remont-pid-klyuch");
export const Route = createFileRoute("/poslugy/remont-pid-klyuch")({
  head: () => heads.service("uk", "remont-pid-klyuch"),
  component: () => <ServicePage service={service} />,
});
