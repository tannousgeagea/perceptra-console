// components/layout/AppBoot.tsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MTXLoader } from "@/components/logo/MTXLoader";

interface AppBootProps {
  children: React.ReactNode;
  /** Minimum milliseconds to hold the boot screen, regardless of load time */
  minDurationMs?: number;
}

export const AppBoot = ({ children, minDurationMs = 2000 }: AppBootProps) => {
  const [booting, setBooting] = React.useState(true);
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const start = performance.now();

    const finish = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(minDurationMs - elapsed, 0);

      window.setTimeout(() => {
        // Signal the progress bar to complete, then exit
        setExiting(true);
        window.setTimeout(() => setBooting(false), 350);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => window.removeEventListener("load", finish);
    }
  }, [minDurationMs]);

  return (
    <>
      {/* App content — preloads while boot is running, but is not interactive */}
      <div
        className="w-full"
        style={{
          pointerEvents: booting ? "none" : "auto",
          userSelect: booting ? "none" : "auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: booting ? 0 : 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>

      {/* Boot screen — rendered on top via fixed positioning inside MTXLoader */}
      <AnimatePresence>
        {booting && (
          <motion.div
            key="app-boot-screen"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            <MTXLoader exiting={exiting} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
