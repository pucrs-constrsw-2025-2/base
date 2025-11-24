import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { ResourceForm } from '../forms/ResourceForm';
import { Resource, CreateResourceDto, UpdateResourceDto, Category } from '../../../types/resources';

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
  categories: Category[];
  onSubmit: (data: CreateResourceDto | UpdateResourceDto) => void;
  loading?: boolean;
}

export function ResourceDialog({
  open,
  onOpenChange,
  resource,
  categories,
  onSubmit,
  loading,
}: ResourceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{resource ? 'Editar Recurso' : 'Novo Recurso'}</DialogTitle>
          <DialogDescription>
            {resource
              ? 'Atualize as informações do recurso computacional'
              : 'Preencha os dados para criar um novo recurso computacional'}
          </DialogDescription>
        </DialogHeader>
        <ResourceForm
          resource={resource}
          categories={categories}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
