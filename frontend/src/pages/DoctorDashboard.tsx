import { Navbar } from "@/components/Navbar";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import DoctorInterface from "@/components/DoctorInterface";
import DoctorPatientDetailView from "@/components/DoctorPatientDetailView";
import { Routes, Route } from "react-router-dom";

const DoctorDashboard = () => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div className="flex w-full">
        <DoctorSidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<DoctorInterface />} />
            <Route path="/patient/:id" element={<DoctorPatientDetailView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;