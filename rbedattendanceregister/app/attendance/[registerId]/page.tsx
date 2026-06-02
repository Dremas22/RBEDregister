import AttendeesRegistered from "../../components/AttendeeRegister"; 

export default async function AttendancePage({ params, }: { 
  params: Promise<{ registerId: string }>; }) { 
    const { registerId } = await params; 
    return ( 
    <div className="p-6"> <AttendeesRegistered registerId={registerId} name="John Doe" date="2023-10-15" /> </div> 
  ); }