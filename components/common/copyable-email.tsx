"üse clients";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyableEmailProps = {
  email?: string;
};

export const CopyableEmail = ({ email }: CopyableEmailProps) => {
  const [copied, setCopied] = useState(false);

  if (!email) return <span>N/A</span>;

  const parts = email.split("@");
  const username = parts[0];
  const domain = parts[1];

  const truncatedEmail =
    username && domain && username.length > 5
      ? `${username.slice(0, 5)}...@${domain}`
      : email;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs">
      <span title={email}>{truncatedEmail}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-text/60 hover:text-text"
        title="Copiar email"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </span>
  );
};
