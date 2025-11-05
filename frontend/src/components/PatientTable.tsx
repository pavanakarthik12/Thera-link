import { useState, useEffect } from "react";
import { Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  adherence_percent?: number;
  risk_label?: string;
}

const getRiskBadgeClass = (risk: string) => {
  switch (risk.toLowerCase()) {
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

export const PatientTable = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, we would fetch all patients from the backend
      // For now, we'll simulate this with a timeout to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data with more realistic structure
      const mockPatients: Patient[] = [
        { id: "1", name: "John Miller", age: 45, gender: "male", condition: "Hypertension", adherence_percent: 92, risk_label: "Low" },
        { id: "2", name: "Sarah Johnson", age: 38, gender: "female", condition: "Diabetes Type 2", adherence_percent: 78, risk_label: "Medium" },
        { id: "3", name: "Michael Chen", age: 62, gender: "male", condition: "Heart Disease", adherence_percent: 45, risk_label: "High" },
        { id: "4", name: "Emily Davis", age: 29, gender: "female", condition: "Asthma", adherence_percent: 88, risk_label: "Low" },
        { id: "5", name: "Robert Wilson", age: 55, gender: "male", condition: "Hypertension", adherence_percent: 62, risk_label: "Medium" },
      ];
      
      setPatients(mockPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients");
      toast.error("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={fetchPatients} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Condition
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Adherence
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((patient, index) => (
              <motion.tr
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-primary">
                        {patient.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{patient.name}</span>
                      <p className="text-xs text-muted-foreground">{patient.age} years, {patient.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {patient.condition}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500",
                          patient.adherence_percent && patient.adherence_percent >= 80 ? "bg-success" :
                          patient.adherence_percent && patient.adherence_percent >= 60 ? "bg-warning" : "bg-destructive"
                        )}
                        style={{ width: `${patient.adherence_percent || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12">
                      {patient.adherence_percent || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getRiskBadgeClass(patient.risk_label || "Unknown")
                  )}>
                    {patient.risk_label || "Unknown"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/patient/${patient.id}`)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};