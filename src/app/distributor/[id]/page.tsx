import DistributorChatClient from "@/components/DistributorChatClient";

export default async function DistributorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return (
    <div className="h-full bg-[#efeae2]">
      <DistributorChatClient distributorId={id} />
    </div>
  );
}
