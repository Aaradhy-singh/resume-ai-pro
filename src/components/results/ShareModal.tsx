import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Linkedin, Twitter, Facebook, MessageCircle, Mail, Link2, X } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  score: number;
  role: string;
}

export function ShareModal({ open, onClose, score, role }: ShareModalProps) {
  const shareText = `I scored ${score}% on ResumeAI for ${role}. Get your free resume analysis:`;
  const shareUrl = window.location.href;
  
  const platforms = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: '#0077B5',
      url: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      color: '#FFFFFF',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: '#EA4335',
      url: `mailto:?subject=My ResumeAI Analysis&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ 
        background: '#0D0D0D', 
        border: '1px solid #1F1F1F',
        maxWidth: '400px'
      }}>
        <DialogHeader>
          <DialogTitle style={{ 
            fontFamily: 'DM Mono', 
            fontSize: '12px', 
            color: '#F0F0F0',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Share Your Results
          </DialogTitle>
        </DialogHeader>
        
        <div style={{ padding: '20px 0' }}>
          {/* Preview */}
          <div style={{ 
            background: '#111111', 
            border: '1px solid #2A2A2A',
            borderLeft: '3px solid #0EA5E9',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{ 
              fontFamily: 'inherit', 
              fontSize: '12px', 
              color: '#F0F0F0',
              lineHeight: 1.6
            }}>
              {shareText}
            </p>
          </div>

          {/* Grid of platforms */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px',
            marginBottom: '20px'
          }}>
            {platforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => window.open(platform.url, '_blank', 'width=600,height=400')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 12px',
                  background: '#111111',
                  border: '1px solid #2A2A2A',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = platform.color;
                  e.currentTarget.style.background = `${platform.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2A2A2A';
                  e.currentTarget.style.background = '#111111';
                }}
              >
                <platform.icon size={24} color={platform.color} />
                <span style={{ 
                  fontFamily: 'DM Mono', 
                  fontSize: '10px', 
                  color: '#9A9A9A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {platform.name}
                </span>
              </button>
            ))}
          </div>

          {/* Copy Link Button */}
          <button
            onClick={handleCopy}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              background: 'transparent',
              border: '1px solid #0EA5E9',
              color: '#0EA5E9',
              fontFamily: 'DM Mono',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(14,165,233,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Link2 size={14} /> Copy Link
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
