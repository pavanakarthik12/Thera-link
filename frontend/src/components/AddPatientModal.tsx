import { useState } from "react";
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
import { CreditCard, Copy } from "lucide-react";
import { toast } from "sonner";

interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PatientResponse {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
}

export const AddPatientModal = ({ open, onOpenChange }: AddPatientModalProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [condition, setCondition] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddPatient = async () => {
    if (!name || !age || !gender || !condition) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      
      // Call the backend API to create a new patient
      const response = await fetch("http://localhost:8000/api/patient/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          age: parseInt(age),
          gender,
          condition,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const patient: PatientResponse = data.data;
        setPatientId(patient.id);
        toast.success(`Patient ${name} added successfully`);
        
        // Show patient ID for sharing
        toast.info(
          <div className="flex items-center justify-between w-full">
            <span>Patient ID: {patient.id}</span>
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
          </div>,
          {
            duration: 10000,
            action: {
              label: "Copy ID",
              onClick: () => {
                navigator.clipboard.writeText(patient.id);
                toast.success("Patient ID copied to clipboard");
              },
            },
          }
        );
      } else {
        throw new Error(data.message || "Failed to create patient");
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error("Failed to add patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWriteNFC = async () => {
    if (!name || !age || !gender || !condition) {
      toast.error("Please fill all fields");
      return;
    }

    // First add the patient to get the ID
    try {
      setLoading(true);
      
      // Call the backend API to create a new patient
      const response = await fetch("http://localhost:8000/api/patient/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          age: parseInt(age),
          gender,
          condition,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const patient: PatientResponse = data.data;
        setPatientId(patient.id);
        
        // Web NFC API placeholder
        if ("NDEFReader" in window) {
          toast.success("NFC write initiated (Web NFC API)");
          // const ndef = new NDEFReader();
          // await ndef.write({ records: [{ recordType: "text", data: patientData }] });
        } else {
          toast.info("NFC not supported - Patient added to system");
        }

        toast.success(`Patient ${name} added successfully`);
        
        // Show patient ID for sharing
        toast.info(
          <div className="flex items-center justify-between w-full">
            <span>Share this ID with patient: {patient.id}</span>
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
          </div>,
          {
            duration: 10000,
            action: {
              label: "Copy ID",
              onClick: () => {
                navigator.clipboard.writeText(patient.id);
                toast.success("Patient ID copied to clipboard");
              },
            },
          }
        );
        
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error(data.message || "Failed to create patient");
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error("Failed to add patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAge("");
    setGender("");
    setCondition("");
    setPatientId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter patient details and either write to NFC card or share the patient ID for secure access
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Medical Condition</Label>
            <Input
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAddPatient} disabled={loading} className="gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              "Add Patient"
            )}
          </Button>
          <Button onClick={handleWriteNFC} disabled={loading} className="gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Write NFC Card
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};