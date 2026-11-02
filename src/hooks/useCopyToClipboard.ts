import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Copy text to the clipboard.
 *
 * `navigator.clipboard` only exists in secure contexts (HTTPS / localhost), so
 * deployments served over plain HTTP on a LAN address fall back to the legacy
 * `execCommand("copy")` path.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** Copy with a toast and a short-lived `copied` flag for icon feedback. */
export function useCopyToClipboard(resetAfterMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string, label = "Value") => {
      const ok = await copyToClipboard(text);
      if (ok) {
        toast.success(`${label} copied`, { description: text, duration: 2000 });
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetAfterMs);
      } else {
        toast.error(`Could not copy ${label.toLowerCase()}`);
      }
      return ok;
    },
    [resetAfterMs]
  );

  return { copy, copied };
}
