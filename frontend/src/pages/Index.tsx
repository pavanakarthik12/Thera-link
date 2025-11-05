import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stethoscope, User, Pill, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 p-8 max-w-4xl"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-6 rounded-full">
            <Pill className="h-16 w-16 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground">
            TheraLink
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Treatment Adherence Passport
          </p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Connecting healthcare providers and patients for better medication adherence
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Select Your Role</h2>
          <p className="text-muted-foreground mb-6">
            Choose the appropriate interface based on your role in the healthcare process
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <Stethoscope className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Healthcare Provider</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Register patients, assign prescriptions, and monitor adherence progress
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/doctor")}
                className="w-full gap-2"
              >
                <Stethoscope className="h-5 w-5" />
                Doctor Portal
              </Button>
            </div>
            
            <div className="bg-secondary rounded-lg p-6 border border-border">
              <User className="h-12 w-12 text-secondary-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Patient</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Access your prescriptions, log medication intake, and track your progress
              </p>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const patientId = prompt("Enter your Patient ID:");
                  if (patientId) {
                    navigate(`/patient/${patientId}`);
                  }
                }}
                className="w-full gap-2"
              >
                <User className="h-5 w-5" />
                Patient View
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>NFC-enabled medication tracking and adherence monitoring</span>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Index;