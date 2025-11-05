import { Navbar } from "@/components/Navbar";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import DoctorInterface from "@/components/DoctorInterface";

const DoctorDashboard = () => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div className="flex w-full">
        <DoctorSidebar />
        <main className="flex-1 overflow-auto">
          <DoctorInterface />
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;