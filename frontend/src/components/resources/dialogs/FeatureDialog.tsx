import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { FeatureForm } from '../forms/FeatureForm';
import { Feature, CreateFeatureDto, UpdateFeatureDto, Category } from '../../../types/resources';

interface FeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: Feature;
  categories: Category[];
  onSubmit: (data: CreateFeatureDto | UpdateFeatureDto) => void;
  loading?: boolean;
}

export function FeatureDialog({
  open,
  onOpenChange,
  feature,
  categories,
  onSubmit,
  loading,
}: FeatureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{feature ? 'Editar Feature' : 'Nova Feature'}</DialogTitle>
          <DialogDescription>
            {feature
              ? 'Atualize as informações da característica'
              : 'Preencha os dados para criar uma nova característica'}
          </DialogDescription>
        </DialogHeader>
        <FeatureForm
          feature={feature}
          categories={categories}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
