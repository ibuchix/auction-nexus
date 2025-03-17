
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const DealerManagement = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the verification page since this is the main functionality
    navigate("/admin/dealers/verification");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin mr-2" />
      <span>Redirecting to dealer verification...</span>
    </div>
  );
};

export default DealerManagement;
