import DistributorChatClient from "@/components/DistributorChatClient";

export default async function DistributorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return (
    <div className="h-full bg-transparent font-geist py-10 px-4 md:px-10 flex items-center justify-center">
      <div className="w-full h-full max-w-6xl max-h-[800px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <DistributorChatClient distributorId={id} />
      </div>
    </div>
  );
}
