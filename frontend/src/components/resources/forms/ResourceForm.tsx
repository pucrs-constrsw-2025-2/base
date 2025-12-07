import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';
import { Resource, CreateResourceDto, UpdateResourceDto, Category } from '../../../types/resources';

interface ResourceFormProps {
  resource?: Resource;
  categories: Category[];
  onSubmit: (data: CreateResourceDto | UpdateResourceDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ResourceForm({ resource, categories, onSubmit, onCancel, loading }: ResourceFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string | null;
    quantity: number;
    status: boolean;
  }>({
    name: resource?.name || '',
    categoryId: resource?.categoryId || null,
    quantity: resource?.quantity || 1,
    status: resource?.status ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantidade deve ser maior ou igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        name: formData.name,
        categoryId: formData.categoryId || '',
        quantity: formData.quantity,
        status: formData.status,
      };
      onSubmit(submitData);
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
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Notebook Dell #123"
          disabled={loading}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">
          Categoria <span className="text-destructive">*</span>
        </Label>
        <select
          id="categoryId"
          value={formData.categoryId ?? ''}
          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
          disabled={loading}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">
          Quantidade <span className="text-destructive">*</span>
        </Label>
        <Input
          id="quantity"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
          placeholder="Ex: 5"
          disabled={loading}
        />
        {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="status"
            checked={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
            disabled={loading}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="status" className="font-normal cursor-pointer">
            {formData.status ? 'Ativo' : 'Inativo'}
          </Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Salvando...' : resource ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
