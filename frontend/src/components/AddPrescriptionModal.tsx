import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface AddPrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Patient {
  id: string;
  name: string;
}

interface TreatmentResponse {
  id: string;
  patient_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  start_date: string;
  schedule_days: string[];
}

export const AddPrescriptionModal = ({ open, onOpenChange }: AddPrescriptionModalProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [customFrequency, setCustomFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);

  // Days of the week for scheduling
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Fetch patients when modal opens
  useEffect(() => {
    if (open) {
      fetchPatients();
      // Set default start date to today
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
    } else {
      // Reset form when closing
      resetForm();
    }
  }, [open]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Fetch patients from the backend
      const response = await fetch("http://localhost:8000/api/patient/all");
      const data = await response.json();
      
      if (data.success) {
        // Transform the patient data to match our interface
        const patientList = data.data.patients.map((p: any) => ({
          id: p.id,
          name: p.name
        }));
        setPatients(patientList);
      } else {
        throw new Error(data.message || "Failed to fetch patients");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
      // Fallback to empty array
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!patient || !medication || !dosage || (!frequency && !customFrequency) || !startDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare frequency value
      const frequencyValue = customFrequency || frequency;
      
      // Prepare schedule days
      const scheduleDaysToSend = useCustomSchedule ? scheduleDays : [];
      
      // Call the backend API to create a new treatment
      const response = await fetch("http://localhost:8000/api/treatment/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: patient,
          medication,
          dosage,
          frequency: frequencyValue,
          start_date: startDate,
          schedule_days: scheduleDaysToSend,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const treatment: TreatmentResponse = data.data;
        toast.success("Prescription added successfully");
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error(data.message || "Failed to create prescription");
      }
    } catch (error) {
      console.error("Error adding prescription:", error);
      toast.error("Failed to add prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPatient("");
    setMedication("");
    setDosage("");
    setFrequency("");
    setCustomFrequency("");
    setStartDate("");
    setScheduleDays([]);
    setUseCustomSchedule(false);
  };

  const toggleDay = (day: string) => {
    setScheduleDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Prescription</DialogTitle>
          <DialogDescription>
            Create a new medication prescription for a patient
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Select Patient *</Label>
            <Select value={patient} onValueChange={setPatient} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medication">Medication Name *</Label>
            <Input
              id="medication"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              {customFrequency ? (
                <Input
                  id="customFrequency"
                  value={customFrequency}
                  onChange={(e) => setCustomFrequency(e.target.value)}
                  disabled={loading}
                />
              ) : (
                <Select value={frequency} onValueChange={setFrequency} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Once daily">Once daily</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                    <SelectItem value="Three times daily">Three times daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="other">Other (specify)</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {frequency === "other" && (
                <Input
                  placeholder="Specify frequency"
                  value={customFrequency}
                  onChange={(e) => setCustomFrequency(e.target.value)}
                  disabled={loading}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCustomSchedule"
                checked={useCustomSchedule}
                onCheckedChange={(checked) => setUseCustomSchedule(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="useCustomSchedule">Set specific days for medication</Label>
            </div>
            
            {useCustomSchedule && (
              <div className="pt-2">
                <Label className="text-sm font-medium">Select Days</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={scheduleDays.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                        disabled={loading}
                      />
                      <Label htmlFor={day} className="text-sm font-normal">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              "Add Prescription"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};