import { PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listTitle: string;
  onShare: () => void;
  onArchive: () => void;
}

export const CompletionModal = ({
  open,
  onOpenChange,
  listTitle,
  onShare,
  onArchive,
}: CompletionModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <PartyPopper className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl">{t('lists.congratulations')}</DialogTitle>
          <DialogDescription className="text-base">
            {t('lists.completedMessage', { listName: listTitle })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onShare} className="w-full">
            {t('lists.share')}
          </Button>
          <Button variant="outline" onClick={onArchive} className="w-full">
            {t('lists.archive')}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            {t('lists.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
