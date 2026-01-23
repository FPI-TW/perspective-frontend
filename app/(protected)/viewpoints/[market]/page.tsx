import ViewpointPage from "./ViewpointPage"

export default function Page({ params }: { params: { market: string } }) {
  return <ViewpointPage market={params.market} />
}
