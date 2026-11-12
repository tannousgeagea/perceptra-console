import React from "react";
import { motion } from "framer-motion";

interface MTXLoaderProps {
  /** True when the app is ready — triggers progress bar completion before exit */
  exiting?: boolean;
}

export const MTXLoader = ({ exiting = false }: MTXLoaderProps) => {
  const uid = React.useId().replace(/:/g, "");
  const ids = {
    badgeGrad: `badge-grad-${uid}`,
    glowFilter: `glow-filt-${uid}`,
    innerHighlight: `inner-hl-${uid}`,
    scanClip: `scan-clip-${uid}`,
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#070C18",
        backgroundImage: [
          "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(90,45,255,0.08) 0%, transparent 70%)",
          "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "auto, 48px 48px, 48px 48px",
      }}
    >
      {/* ─── Centre content ─── */}
      <div className="relative flex flex-col items-center gap-5">

        {/* Ambient glow halo behind badge */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 220,
            height: 220,
            top: "50%",
            left: "50%",
            translate: "-50% -55%",
            background:
              "radial-gradient(circle, rgba(90,45,255,0.3) 0%, rgba(41,112,255,0.12) 45%, transparent 70%)",
            filter: "blur(32px)",
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Badge with animated M mark */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.85, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          <svg
            width="76"
            height="76"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Badge gradient */}
              <linearGradient
                id={ids.badgeGrad}
                x1="0" y1="0" x2="36" y2="36"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#5A2DFF" />
                <stop offset="55%" stopColor="#7C3AFF" />
                <stop offset="100%" stopColor="#2970FF" />
              </linearGradient>

              {/* Inner highlight for 3D feel */}
              <radialGradient
                id={ids.innerHighlight}
                cx="28%" cy="22%"
                r="55%"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>

              {/* Glow filter for the M path */}
              <filter id={ids.glowFilter} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Clip path for the scan line */}
              <clipPath id={ids.scanClip}>
                <rect width="36" height="36" rx="9" />
              </clipPath>
            </defs>

            {/* Badge background */}
            <rect width="36" height="36" rx="9" fill={`url(#${ids.badgeGrad})`} />

            {/* Specular inner highlight */}
            <rect
              width="36" height="36" rx="9"
              fill={`url(#${ids.innerHighlight})`}
              opacity="0.14"
            />

            {/* Scan line that sweeps after M draws */}
            <g clipPath={`url(#${ids.scanClip})`}>
              <motion.rect
                x={0}
                width={36}
                height={1.5}
                fill="rgba(255,255,255,0.55)"
                rx={0.5}
                initial={{ y: -2, opacity: 0 }}
                animate={{ y: [0, 38], opacity: [0.75, 0] }}
                transition={{
                  delay: 1.2,
                  duration: 0.5,
                  ease: "linear",
                }}
              />
            </g>

            {/* Geometric M path — draws in */}
            <motion.path
              d="M7.5 27 L7.5 9.5 L18 19.5 L28.5 9.5 L28.5 27"
              stroke="white"
              strokeWidth="2.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
              filter={`url(#${ids.glowFilter})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: {
                  delay: 0.32,
                  duration: 0.78,
                  ease: [0.4, 0, 0.2, 1],
                },
                opacity: { delay: 0.32, duration: 0.06 },
              }}
            />
          </svg>

          {/* Ring pulse after M completes */}
          <motion.div
            className="absolute inset-0 rounded-[13px] pointer-events-none"
            style={{ boxShadow: "0 0 0 1.5px rgba(122,80,255,0.65)" }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: [0, 0.85, 0], scale: [0.9, 1.06, 1.14] }}
            transition={{ delay: 1.15, duration: 0.65, ease: "easeOut" }}
          />
        </motion.div>

        {/* Wordmark + tagline */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: 1.0,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span
            className="font-outfit leading-none"
            style={{ fontSize: "30px", letterSpacing: "-0.025em" }}
          >
            <span style={{ fontWeight: 300, color: "rgba(255,255,255,0.55)" }}>
              Malu
            </span>
            <span style={{ fontWeight: 600, color: "#ffffff" }}>
              metrix
            </span>
          </span>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.35, duration: 0.45 }}
            className="font-outfit uppercase"
            style={{
              fontSize: "9.5px",
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.25)",
              fontWeight: 400,
            }}
          >
            Visual Intelligence
          </motion.p>
        </motion.div>
      </div>

      {/* ─── Bottom progress rail ─── */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "2px", backgroundColor: "rgba(255,255,255,0.05)" }}
      >
        <motion.div
          className="h-full"
          style={{
            background: "linear-gradient(90deg, #5A2DFF 0%, #8A3FFC 52%, #2970FF 100%)",
            originX: 0,
          }}
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: exiting ? 1 : [0, 0.42, 0.76, 0.91, 0.97],
          }}
          transition={
            exiting
              ? { duration: 0.2, ease: "easeIn" }
              : {
                  duration: 1.7,
                  times: [0, 0.15, 0.48, 0.78, 1],
                  ease: "easeOut",
                }
          }
        />
      </div>
    </div>
  );
};
