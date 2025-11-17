import { ScanEye } from 'lucide-react';

export const SignupHeader = () => {
  return (
    <div className="text-center space-y-4 animate-fade-in">
      {/* Logo */}
      <div className="flex justify-center items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <ScanEye className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">VisionNest</h1>
        </div>
      </div>

      {/* Welcome Message */}
      {/* <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Create your account
        </h2>
        <p className="text-muted-foreground">
          Start transforming your data into insights
        </p>
      </div> */}
    </div>
  );
};
