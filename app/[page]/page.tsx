import NileSite from "../site";

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return <NileSite page={page} />;
}
