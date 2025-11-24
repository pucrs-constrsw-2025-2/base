import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { FeatureValueForm } from '../forms/FeatureValueForm';
import { CreateFeatureValueDto, UpdateFeatureValueDto, Feature } from '../../../types/resources';

interface FeatureValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureValue?: any;
  features: Feature[];
  resourceId?: string;
  onSubmit: (data: CreateFeatureValueDto | UpdateFeatureValueDto) => void;
  loading?: boolean;
}

export function FeatureValueDialog({
  open,
  onOpenChange,
  featureValue,
  features,
  resourceId,
  onSubmit,
  loading,
}: FeatureValueDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {featureValue ? 'Editar Valor' : 'Adicionar Característica'}
          </DialogTitle>
          <DialogDescription>
            {featureValue
              ? 'Atualize o valor da característica'
              : 'Selecione uma característica e defina seu valor'}
          </DialogDescription>
        </DialogHeader>
        <FeatureValueForm
          featureValue={featureValue}
          features={features}
          preselectedResourceId={resourceId}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
