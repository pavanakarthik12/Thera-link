import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AIMessageCardProps {
  message: string;
}

export const AIMessageCard = ({ message }: AIMessageCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-5 border border-primary/20 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/20 p-2 rounded-lg shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            AI Health Coach
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
