import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("uk", "zagalnobudivelni-roboty");
export const Route = createFileRoute("/poslugy/zagalnobudivelni-roboty")({
  head: () => heads.service("uk", "zagalnobudivelni-roboty"),
  component: () => <ServicePage service={service} />,
});
