import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, Pill, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
}

interface Treatment {
  id: string;
  patient_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  start_date: string;
  schedule_days: string[];
}

interface DoseLog {
  id: string;
  patient_id: string;
  medication: string;
  status: string;
  date: string;
}

interface PatientWithTreatments {
  patient: PatientData;
  treatments: Treatment[];
}

interface MissedDayInfo {
  scheduled_days: string[];
  missed_days: {
    date: string;
    medication: string;
  }[];
  total_missed: number;
}

interface PatientSummary {
  name: string;
  adherence: number;
  risk_label: string;
  feedback: string;
  missed_days: Record<string, MissedDayInfo>;
}

const DoctorPatientDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientWithTreatments | null>(null);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [adherencePercentage, setAdherencePercentage] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<string>("");
  const [missedDaysInfo, setMissedDaysInfo] = useState<Record<string, MissedDayInfo>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient data and treatments
  const fetchPatientData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/patient/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setPatientData(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch patient data");
      }
    } catch (err) {
      setError("Failed to load patient data");
      toast.error("Error loading patient data");
      console.error("Error fetching patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient summary (adherence, risk, missed days)
  const fetchPatientSummary = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/summary/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const summary: PatientSummary = data.data;
        setAdherencePercentage(summary.adherence);
        setRiskLevel(summary.risk_label);
        setMissedDaysInfo(summary.missed_days || {});
      } else {
        throw new Error(data.message || "Failed to fetch patient summary");
      }
    } catch (err) {
      toast.error("Error loading patient summary");
      console.error("Error fetching patient summary:", err);
    }
  };

  // Fetch dose logs
  const fetchDoseLogs = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/dose_logs/patient/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setDoseLogs(data.data.dose_logs || []);
      } else {
        throw new Error(data.message || "Failed to fetch dose logs");
      }
    } catch (err) {
      console.error("Error fetching dose logs:", err);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    await Promise.all([fetchPatientData(), fetchPatientSummary(), fetchDoseLogs()]);
    toast.success("Data refreshed successfully");
  };

  // Initialize data on component mount
  useEffect(() => {
    if (id) {
      Promise.all([fetchPatientData(), fetchPatientSummary(), fetchDoseLogs()]);
    }
  }, [id]);

  const getRiskBadgeClass = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "bg-success/10 text-success";
      case "medium":
        return "bg-warning/10 text-warning";
      case "high":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "taken":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "missed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "taken":
        return "Taken";
      case "missed":
        return "Missed";
      default:
        return "Pending";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "taken":
        return "bg-success/10 text-success";
      case "missed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-warning/10 text-warning";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 bg-card rounded-lg border border-border max-w-md">
          <div className="flex items-center justify-center mb-4">
            <ArrowLeft 
              className="h-6 w-6 text-primary cursor-pointer mr-4" 
              onClick={() => navigate(-1)} 
            />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Patient Data</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Unable to load patient data. Please check your connection and try again."}
          </p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { patient, treatments } = patientData;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border p-6"
      >
        <div className="flex items-center mb-4">
          <ArrowLeft 
            className="h-6 w-6 text-primary cursor-pointer mr-4" 
            onClick={() => navigate(-1)} 
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-sm text-muted-foreground">Patient Details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="font-semibold">{patient.age} years</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-semibold capitalize">{patient.gender}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Condition</p>
            <p className="font-semibold">{patient.condition}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Patient ID</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{patient.id.substring(0, 8)}...</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(patient.id);
                  toast.success("Patient ID copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Adherence Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 border border-border shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Adherence Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-3xl font-bold text-foreground">{Math.round(adherencePercentage)}%</p>
              <p className="text-sm text-muted-foreground">Overall Adherence</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                getRiskBadgeClass(riskLevel)
              )}>
                {riskLevel}
              </span>
              <p className="text-sm text-muted-foreground mt-2">Risk Level</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-3xl font-bold text-foreground">
                {Object.values(missedDaysInfo).reduce((sum, info) => sum + info.total_missed, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Missed Doses</p>
            </div>
          </div>
        </motion.div>

        {/* Prescriptions and Adherence */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Prescriptions & Adherence</h2>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <Clock className="h-4 w-4" />
            </Button>
          </div>
          
          {treatments.length === 0 ? (
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No prescriptions assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {treatments.map((treatment) => {
                const medicationMissedInfo = missedDaysInfo[treatment.medication] || {
                  scheduled_days: [],
                  missed_days: [],
                  total_missed: 0
                };
                
                return (
                  <motion.div
                    key={treatment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl p-5 border border-border shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{treatment.medication}</h3>
                        <p className="text-sm text-muted-foreground">{treatment.dosage}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{treatment.frequency}</p>
                        <p className="text-xs text-muted-foreground">Frequency</p>
                      </div>
                    </div>
                    
                    {treatment.schedule_days && treatment.schedule_days.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-1">Scheduled Days</p>
                        <div className="flex flex-wrap gap-1">
                          {treatment.schedule_days.map((day) => (
                            <span 
                              key={day} 
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Adherence Status</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-500",
                                adherencePercentage >= 80 ? "bg-success" :
                                adherencePercentage >= 60 ? "bg-warning" : "bg-destructive"
                              )}
                              style={{ width: `${adherencePercentage || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground w-12">
                            {adherencePercentage || 0}%
                          </span>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getRiskBadgeClass(riskLevel)
                        )}>
                          {riskLevel}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Missed Doses</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {medicationMissedInfo.total_missed} missed doses
                        </span>
                        {medicationMissedInfo.missed_days.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Last missed: {medicationMissedInfo.missed_days[0]?.date || 'N/A'}
                          </div>
                        )}
                      </div>
                      
                      {medicationMissedInfo.missed_days.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          <div className="text-xs space-y-1">
                            {medicationMissedInfo.missed_days.slice(0, 5).map((missed, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <XCircle className="h-3 w-3 text-destructive" />
                                <span>{missed.date}</span>
                              </div>
                            ))}
                            {medicationMissedInfo.missed_days.length > 5 && (
                              <div className="text-muted-foreground">
                                +{medicationMissedInfo.missed_days.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <Button onClick={handleRefresh} variant="outline" className="flex-1 gap-2">
            <Clock className="h-4 w-4" />
            Refresh Data
          </Button>
          <Button 
            onClick={() => navigate(`/patient/${id}`)} 
            variant="outline" 
            className="flex-1 gap-2"
          >
            <Pill className="h-4 w-4" />
            Patient View
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorPatientDetailView;