
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Link } from "react-router-dom";

export default function NoPermissionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Ban className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
        
        <p className="text-gray-600">
          Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>

        <Button asChild className="mt-6">
          <Link to="/">
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}