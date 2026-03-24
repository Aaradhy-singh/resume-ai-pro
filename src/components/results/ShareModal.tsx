import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Linkedin, Twitter, Link2, X } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  score: number;
  role: string;
}

export function ShareModal({ open, onClose, score, role }: ShareModalProps) {
  const shareText = `I scored ${score}% on ResumeAI for ${role}. Here's my action plan to improve:`;
  const shareUrl = window.location.href;

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ background: '#0D0D0D', border: '1px solid #1F1F1F' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'DM Mono', fontSize: '14px', color: '#FFFFFF' }}>
            Share Your Results
          </DialogTitle>
        </DialogHeader>
        
        <div style={{ padding: '20px 0' }}>
          <p style={{ 
            fontFamily: 'inherit', 
            fontSize: '12px', 
            color: '#E0E0E0',
            marginBottom: '20px',
            padding: '12px',
            background: '#111111',
            borderLeft: '3px solid #0EA5E9'
          }}>
            {shareText}
          </p>
          
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button
              onClick={handleLinkedIn}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                background: '#0a66c2',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <Linkedin size={16} /> Share on LinkedIn
            </button>
            
            <button
              onClick={handleTwitter}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                background: '#000000',
                color: 'white',
                border: '1px solid #333',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <X size={16} /> Share on X/Twitter
            </button>
            
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                background: 'transparent',
                color: '#0EA5E9',
                border: '1px solid #0EA5E9',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <Link2 size={16} /> Copy Link Only
            </button>
          </div>
          
          <p style={{ 
            fontSize: '10px', 
            color: '#6B6B6B', 
            marginTop: '16px',
            textAlign: 'center'
          }}>
            Opens in new window • Your data stays private
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
