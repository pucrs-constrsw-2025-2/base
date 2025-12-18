import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../types/resources';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CategoryForm({ category, onSubmit, onCancel, loading }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            // Limpar erro quando usuário digita
            if (errors.name) {
              setErrors({ ...errors, name: '' });
            }
          }}
          onBlur={() => {
            // Validar campo individual ao sair
            if (!formData.name.trim()) {
              setErrors({ ...errors, name: 'Nome é obrigatório' });
            } else if (formData.name.length < 3) {
              setErrors({ ...errors, name: 'Nome deve ter pelo menos 3 caracteres' });
            }
          }}
          placeholder="Ex: Notebooks, Projetores"
          disabled={loading}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Salvando...' : category ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
