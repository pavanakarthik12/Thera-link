import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { RefreshCw, History, Calendar, Check, X, AlertCircle, Clock, Pill, Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIMessageCard } from "@/components/AIMessageCard";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./PatientInterface.css";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types for our data
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

interface PatientWithTreatments {
  patient: PatientData;
  treatments: Treatment[];
}

interface DoseLogResponse {
  dose_log_id: string;
  adherence_percent: number;
  risk_label: string;
  feedback_message: string;
}

interface PatientSummary {
  name: string;
  adherence: number;
  risk_label: string;
  feedback: string;
  missed_days: Record<string, any>;
}

// Function to generate medication schedule
const generateMedicationSchedule = (treatments: Treatment[]) => {
  const schedule = [];
  const today = new Date();
  
  // For each treatment, generate schedule for the next 7 days
  for (const treatment of treatments) {
    const startDate = new Date(treatment.start_date);
    
    // Generate schedule for next 7 days
    for (let i = 0; i < 7; i++) {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + i);
      
      // Check if this medication should be taken on this day
      const dayOfWeek = scheduleDate.toLocaleDateString('en-US', { weekday: 'long' });
      const shouldTakeToday = treatment.schedule_days.length === 0 || treatment.schedule_days.includes(dayOfWeek);
      
      if (shouldTakeToday && scheduleDate >= startDate) {
        schedule.push({
          id: `${treatment.id}-${scheduleDate.toISOString().split('T')[0]}`,
          treatmentId: treatment.id,
          medication: treatment.medication,
          dosage: treatment.dosage,
          date: scheduleDate.toISOString().split('T')[0],
          dayOfWeek: scheduleDate.toLocaleDateString('en-US', { weekday: 'short' }),
          dayOfMonth: scheduleDate.getDate(),
          isToday: i === 0,
          isFuture: i > 0,
          status: 'pending' // pending, taken, missed
        });
      }
    }
  }
  
  // Sort by date
  return schedule.sort((a, b) => a.date.localeCompare(b.date));
};

const PatientInterface = () => {
  const { id } = useParams<{ id: string }>();
  const [patientData, setPatientData] = useState<PatientWithTreatments | null>(null);
  const [adherencePercentage, setAdherencePercentage] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [medicationSchedule, setMedicationSchedule] = useState<any[]>([]);
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);

  // Check NFC support
  useEffect(() => {
    // Check if Web NFC is supported
    if ('NDEFReader' in window) {
      setNfcSupported(true);
      // Set up NFC reading
      setupNFCReading();
    }
  }, []);

  // Set up NFC reading
  const setupNFCReading = async () => {
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      console.log("NFC scanning started...");
      
      ndef.onreading = (event: any) => {
        try {
          const record = event.message.records[0];
          const url = new TextDecoder().decode(record.data);
          if (url.includes("/patient/")) {
            // Redirect to the patient dashboard URL
            window.location.href = url;
          }
        } catch (err) {
          console.error("Error reading NFC tag:", err);
        }
      };
    } catch (err) {
      console.log("NFC unavailable:", err);
    }
  };

  // Fetch patient data and treatments
  const fetchPatientData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/patient/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setPatientData(data.data);
        // Generate medication schedule
        const schedule = generateMedicationSchedule(data.data.treatments);
        setMedicationSchedule(schedule);
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

  // Fetch patient summary (adherence, risk, AI feedback)
  const fetchPatientSummary = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/summary/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const summary: PatientSummary = data.data;
        setAdherencePercentage(summary.adherence);
        setRiskLevel(summary.risk_label);
        setAiMessage(summary.feedback);
      } else {
        throw new Error(data.message || "Failed to fetch patient summary");
      }
    } catch (err) {
      toast.error("Error loading patient summary");
      console.error("Error fetching patient summary:", err);
    }
  };

  // Log a dose as taken or missed
  const logDose = async (medication: string, status: "Taken" | "Missed", scheduleItemId: string, scheduleDate: string) => {
    if (!id) return;
    
    // Check if the date is today
    const today = new Date().toISOString().split('T')[0];
    if (scheduleDate !== today) {
      toast.error("You can only update medication status for today's doses");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/log_dose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: id,
          medication: medication,
          status: status,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const doseData: DoseLogResponse = data.data;
        setAdherencePercentage(doseData.adherence_percent);
        setRiskLevel(doseData.risk_label);
        setAiMessage(doseData.feedback_message);
        toast.success(`Medication marked as ${status.toLowerCase()}`);
        
        // Update the schedule item status
        setMedicationSchedule(prev => prev.map(item => 
          item.id === scheduleItemId ? { ...item, status: status.toLowerCase() } : item
        ));
        
        // Refresh patient data to get updated treatments
        fetchPatientData();
      } else {
        throw new Error(data.message || `Failed to log dose as ${status.toLowerCase()}`);
      }
    } catch (err) {
      toast.error(`Error marking medication as ${status.toLowerCase()}`);
      console.error("Error logging dose:", err);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    await Promise.all([fetchPatientData(), fetchPatientSummary()]);
    toast.success("Data refreshed successfully");
  };

  // Copy patient URL to clipboard
  const copyPatientUrl = () => {
    if (!id) return;
    const url = `http://localhost:8081/patient/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Patient URL copied to clipboard");
  };

  // Initialize data on component mount
  useEffect(() => {
    if (id) {
      Promise.all([fetchPatientData(), fetchPatientSummary()]);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 bg-card rounded-lg border border-border max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Unable to load patient data. Please check your connection and try again."}
          </p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { patient, treatments } = patientData;
  const patientUrl = `http://localhost:8081/patient/${patient.id}`;

  return (
    <div className="min-h-screen bg-background pb-20 patient-dashboard">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border p-6 patient-header"
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground patient-name">Hello, {patient.name} 👋</h1>
          <p className="text-sm text-muted-foreground">Let's keep your health on track today</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Patient ID: {patient.id}</p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={copyPatientUrl}
              className="h-6 px-2 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Link
            </Button>
          </div>
        </div>
      </motion.header>

      {/* NFC Info Section */}
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 nfc-notification">
          <div className="flex items-start gap-3">
            <QrCode className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 nfc-icon" />
            <div>
              <h3 className="font-medium text-foreground">NFC Access</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {nfcSupported 
                  ? "Your device supports NFC. Tap your TheraLink card to open this dashboard." 
                  : "Tap your TheraLink card or manually enter your patient ID."}
              </p>
              <p className="text-xs text-muted-foreground mt-2 break-all">
                {patientUrl}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Adherence Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 border border-border shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Adherence</h2>
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 adherence-circle">
              <CircularProgressbar
                value={adherencePercentage}
                text={`${Math.round(adherencePercentage)}%`}
                styles={buildStyles({
                  textSize: "20px",
                  pathColor: adherencePercentage >= 80 ? "#10B981" : adherencePercentage >= 60 ? "#F59E0B" : "#EF4444",
                  textColor: "hsl(217 33% 17%)",
                  trailColor: "hsl(217 20% 94%)",
                })}
              />
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-foreground">Risk Level: {riskLevel}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {adherencePercentage >= 80 
                ? "You're doing great! Keep up the excellent work." 
                : adherencePercentage >= 60 
                  ? "Good progress! Try to be more consistent." 
                  : "Let's work on improving your adherence."}
            </p>
          </div>
        </motion.div>

        {/* AI Health Coach */}
        {aiMessage && (
          <AIMessageCard message={aiMessage} />
        )}

        {/* Medication Schedule */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Your Medication Schedule</h2>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          {medicationSchedule.length === 0 ? (
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No medications scheduled for the next 7 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicationSchedule.map((scheduleItem) => (
                <motion.div
                  key={scheduleItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-card rounded-xl p-5 border border-border shadow-sm medication-card",
                    scheduleItem.isToday && "border-primary border-2"
                  )}
                >
                  <div className="flex justify-between items-start mb-3 medication-header">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-foreground medication-title">{scheduleItem.medication}</h3>
                        {scheduleItem.isToday && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            Today
                          </span>
                        )}
                        {scheduleItem.isFuture && (
                          <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                            Future
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{scheduleItem.dosage}</p>
                    </div>
                    <div className="text-right medication-date">
                      <p className="text-sm font-medium text-foreground">
                        {scheduleItem.dayOfWeek} {scheduleItem.dayOfMonth}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scheduleItem.date === new Date().toISOString().split('T')[0] ? 'Today' : scheduleItem.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 action-buttons">
                    {scheduleItem.isFuture ? (
                      <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg py-2">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-muted-foreground text-sm">
                          Available on {scheduleItem.date}
                        </span>
                      </div>
                    ) : scheduleItem.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => logDose(scheduleItem.medication, "Taken", scheduleItem.id, scheduleItem.date)}
                          className="flex-1 bg-success hover:bg-success/90 h-11 action-button"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Taken
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => logDose(scheduleItem.medication, "Missed", scheduleItem.id, scheduleItem.date)}
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 h-11 action-button"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Missed
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg",
                          scheduleItem.status === 'taken' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {scheduleItem.status === 'taken' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {scheduleItem.status === 'taken' ? 'Taken' : 'Missed'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Your Prescriptions</h2>
          
          {treatments.length === 0 ? (
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm text-center">
              <p className="text-muted-foreground">No prescriptions assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <motion.div
                  key={treatment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-5 border border-border shadow-sm prescription-card"
                >
                  <div className="flex justify-between items-start mb-3 prescription-header">
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
                      <p className="text-xs text-muted-foreground mb-1">Schedule</p>
                      <div className="flex flex-wrap gap-1 schedule-tags">
                        {treatment.schedule_days.map((day) => (
                          <span 
                            key={day} 
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded schedule-tag"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons - Sticky on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 sticky-footer"
        >
          <Button onClick={handleRefresh} variant="outline" className="flex-1 gap-2 action-button">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex-1 gap-2 action-button" disabled>
            <History className="h-4 w-4" />
            View History
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientInterface;