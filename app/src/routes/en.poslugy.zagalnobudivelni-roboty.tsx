import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { heads, serviceFor } from "../slava/heads";
const service = serviceFor("en", "zagalnobudivelni-roboty");
export const Route = createFileRoute("/en/poslugy/zagalnobudivelni-roboty")({
  head: () => heads.service("en", "zagalnobudivelni-roboty"),
  component: () => <ServicePage service={service} />,
});
