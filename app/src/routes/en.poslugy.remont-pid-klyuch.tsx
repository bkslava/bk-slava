import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("en", "remont-pid-klyuch");
export const Route = createFileRoute("/en/poslugy/remont-pid-klyuch")({
  head: () => heads.service("en", "remont-pid-klyuch"),
  component: () => <ServicePage service={service} />,
});
