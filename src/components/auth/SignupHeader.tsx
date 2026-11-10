import { MTXLogo } from '@/components/logo/MTXLogo';

export const SignupHeader = () => {
  return (
    <div className="text-center space-y-4 animate-fade-in">
      {/* Logo */}
      <div className="flex justify-center items-center">
        <MTXLogo badgeClassName="w-8 h-8" />
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
