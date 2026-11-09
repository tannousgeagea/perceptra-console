// components/invitations/InvitationBox.tsx
//
// The organization's name framed like an annotated object: corner brackets
// and a class-label tag. The label is the role you're invited as.

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InvitationBoxProps {
  name: string;
  role: string;
  size?: 'hero' | 'compact';
  /** Light surfaces (sign-in / sign-up pages) vs the ink panel. */
  tone?: 'ink' | 'paper';
  className?: string;
}

const SIGNAL = '#2970FF';

const corners = [
  'left-0 top-0 border-l-2 border-t-2 rounded-tl-[3px]',
  'right-0 top-0 border-r-2 border-t-2 rounded-tr-[3px]',
  'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-[3px]',
  'right-0 bottom-0 border-r-2 border-b-2 rounded-br-[3px]',
];

export const InvitationBox = ({ name, role, size = 'hero', tone = 'ink', className }: InvitationBoxProps) => {
  const reduceMotion = useReducedMotion();
  const hero = size === 'hero';
  const arm = hero ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-3 w-3';

  return (
    <div className={cn('relative inline-block max-w-full', hero ? 'mt-7' : 'mt-5', className)}>
      {/* Class label, attached to the box's top-left like in the annotation tool */}
      <span
        className={cn(
          'absolute left-0 -translate-y-full rounded-t-[4px] font-semibold leading-none text-white',
          hero ? 'px-2.5 py-1.5 text-[13px]' : 'px-2 py-1 text-[11px]'
        )}
        style={{ background: SIGNAL }}
      >
        {role.toLowerCase()}
      </span>

      {/* Faint full outline, with brackets on the corners */}
      <div
        className={cn(
          'relative',
          hero ? 'px-6 py-5 sm:px-8 sm:py-6' : 'px-4 py-2.5',
          tone === 'ink' ? 'bg-[#2970FF]/[0.06]' : 'bg-[#2970FF]/[0.05]'
        )}
        style={{ boxShadow: `inset 0 0 0 1px ${SIGNAL}40` }}
      >
        {corners.map((position, i) => (
          <motion.span
            key={position}
            aria-hidden
            className={cn('absolute', arm, position)}
            style={{ borderColor: SIGNAL }}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
          />
        ))}
        <span
          className={cn(
            'block break-words font-semibold tracking-tight',
            hero ? 'text-[34px] leading-[1.1] sm:text-[46px]' : 'text-lg leading-tight',
            tone === 'ink' ? 'text-white' : 'text-[var(--mtx-text)]'
          )}
        >
          {name}
        </span>
      </div>
    </div>
  );
};
