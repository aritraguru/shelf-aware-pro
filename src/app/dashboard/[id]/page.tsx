import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  
  return (
    <div className="h-full flex flex-col bg-transparent">
      <DashboardClient distributorId={id} />
    </div>
  );
}
