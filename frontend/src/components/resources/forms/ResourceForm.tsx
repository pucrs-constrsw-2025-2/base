import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Resource, CreateResourceDto, UpdateResourceDto, Category, ResourceStatus } from '../../../types/resources';

interface ResourceFormProps {
  resource?: Resource;
  categories: Category[];
  onSubmit: (data: CreateResourceDto | UpdateResourceDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

const statusOptions: { value: ResourceStatus; label: string }[] = [
  { value: 'available', label: 'Disponível' },
  { value: 'in-use', label: 'Em Uso' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'unavailable', label: 'Indisponível' },
];

export function ResourceForm({ resource, categories, onSubmit, onCancel, loading }: ResourceFormProps) {
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    categoryId: resource?.categoryId || '',
    description: resource?.description || '',
    status: resource?.status || 'available' as ResourceStatus,
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

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
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
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          disabled={loading}
        >
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as ResourceStatus })}
          disabled={loading}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do recurso"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : resource ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
