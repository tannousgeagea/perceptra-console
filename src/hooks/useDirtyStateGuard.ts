// import { useEffect, useCallback } from 'react';
// import { useBlocker } from 'react-router-dom';

// interface UseDirtyStateGuardOptions {
//   isDirty: boolean;
//   message?: string;
// }

// /**
//  * Prevents navigation and page unload when there are unsaved changes
//  */
// export const useDirtyStateGuard = ({ 
//   isDirty, 
//   message = 'You have unsaved changes. Are you sure you want to leave?' 
// }: UseDirtyStateGuardOptions) => {
  
//   // Block react-router navigation
//   const blocker = useBlocker(
//     ({ currentLocation, nextLocation }) =>
//       isDirty && currentLocation.pathname !== nextLocation.pathname
//   );

//   // Block browser navigation (refresh, close tab, back button)
//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (isDirty) {
//         e.preventDefault();
//         e.returnValue = message;
//         return message;
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [isDirty, message]);

//   const confirmNavigation = useCallback(() => {
//     if (blocker.state === 'blocked') {
//       const confirmed = window.confirm(message);
//       if (confirmed) {
//         blocker.proceed();
//       } else {
//         blocker.reset();
//       }
//     }
//   }, [blocker, message]);

//   // Auto-prompt when blocker activates
//   useEffect(() => {
//     if (blocker.state === 'blocked') {
//       confirmNavigation();
//     }
//   }, [blocker.state, confirmNavigation]);

//   return {
//     isBlocked: blocker.state === 'blocked',
//     proceed: blocker.proceed,
//     reset: blocker.reset,
//   };
// };


import { useEffect } from 'react';

interface UseDirtyStateGuardOptions {
  isDirty: boolean;
  message?: string;
}

export const useDirtyStateGuard = ({ 
  isDirty, 
  message = 'You have unsaved changes. Are you sure you want to leave?' 
}: UseDirtyStateGuardOptions) => {
  
  // Only use browser navigation guard (no react-router blocker)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);
};