import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { RefreshCw, History, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIMessageCard } from "@/components/AIMessageCard";
import { Navbar } from "@/components/Navbar";
import PatientInterface from "@/components/PatientInterface";

const PatientDashboard = () => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <PatientInterface />
    </div>
  );
};

export default PatientDashboard;
