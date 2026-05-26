import AttendeesRegistered from "@/app/components/AttendeeRegister";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ registerId: string }>;
}) {
  const { registerId } = await params;

  return (
    <div className="p-6">
      <AttendeesRegistered registerId={registerId} />
    </div>
  );
}