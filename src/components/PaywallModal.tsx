import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaywallModal = ({ isOpen, onClose }: PaywallModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/auth');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{t('unlockSection')}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {t('proDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">£9.99</div>
            <div className="text-sm text-muted-foreground">{t('perYear')}</div>
          </div>

          <Button className="w-full" size="lg" onClick={handleUpgrade}>
            {t('upgradeToPro')}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={onClose}
          >
            {t('maybeLater')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
