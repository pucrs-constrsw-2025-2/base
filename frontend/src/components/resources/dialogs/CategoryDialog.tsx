import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { CategoryForm } from '../forms/CategoryForm';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../types/resources';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => void;
  loading?: boolean;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  loading,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          <DialogDescription>
            {category
              ? 'Atualize as informações da categoria'
              : 'Preencha os dados para criar uma nova categoria'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
