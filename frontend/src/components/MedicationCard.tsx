import { Clock, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MedicationCardProps {
  name: string;
  dosage: string;
  nextDose: string;
  index: number;
}

export const MedicationCard = ({ name, dosage, nextDose, index }: MedicationCardProps) => {
  const handleTaken = () => {
    toast.success(`${name} marked as taken`, {
      description: "Great job staying on track!",
    });
  };

  const handleMissed = () => {
    toast.error(`${name} marked as missed`, {
      description: "Try to take it as soon as possible",
    });
  };

  const handleSideEffect = () => {
    toast.warning(`Side effect reported for ${name}`, {
      description: "Your doctor has been notified",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{dosage}</p>
        </div>
        <div className="bg-primary/10 p-2 rounded-lg">
          <Clock className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1">Next dose</p>
        <p className="text-sm font-medium text-foreground">{nextDose}</p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleTaken}
          className="flex-1 bg-success hover:bg-success/90"
        >
          <Check className="h-4 w-4 mr-1" />
          Taken
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleMissed}
          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4 mr-1" />
          Missed
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSideEffect}
          className="border-warning/30 text-warning hover:bg-warning/10"
        >
          <AlertTriangle className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};