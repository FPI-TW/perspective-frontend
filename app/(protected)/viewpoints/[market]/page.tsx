import ViewpointPage from "./ViewpointPage"

type Props = {
  params: Promise<{ market: string }>
}

export default async function Page({ params }: Props) {
  const market = (await params).market

  return <ViewpointPage market={market} />
}
