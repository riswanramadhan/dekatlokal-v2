import type { SVGProps } from "react";
type Props = SVGProps<SVGSVGElement> & { size?: number };
export function WhatsAppIcon({ size = 20, ...props }: Props) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M20.6 11.7a8.5 8.5 0 0 1-12.8 7.4L3 20.5l1.4-4.6a8.5 8.5 0 1 1 16.2-4.2Z" /><path d="M8.3 7.3c-.5-.2-1 .6-1 1.3 0 2.7 4 6.8 6.9 6.8.8 0 1.7-1.1 1.5-1.6l-2-1c-.4-.2-.7.8-1.1.8-.9-.2-2.8-1.9-3.1-2.8-.1-.4.9-.8.7-1.2l-.9-2.1Z" /></svg>;
}
export function InstagramFacebookIcon({ size = 20, ...props }: Props) {
  return <svg width={size+12} height={size} viewBox="0 0 36 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="1" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="12" r="3.5" /><circle cx="13.8" cy="7.5" r=".8" fill="currentColor" stroke="none" /><path d="M29 21V12h3l.5-4H29V6c0-1 .3-1.5 1.6-1.5H33V1.3c-.5-.1-1.9-.3-3.4-.3-3.3 0-5.1 2-5.1 5.4V8H22v4h2.5v9" /></svg>;
}
