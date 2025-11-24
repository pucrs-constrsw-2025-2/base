import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Feature, CreateFeatureDto, UpdateFeatureDto, Category, ValueType } from '../../../types/resources';

interface FeatureFormProps {
  feature?: Feature;
  categories: Category[];
  onSubmit: (data: CreateFeatureDto | UpdateFeatureDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

const valueTypeOptions: { value: ValueType; label: string }[] = [
  { value: 'string', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Sim/Não' },
  { value: 'date', label: 'Data' },
];

export function FeatureForm({ feature, categories, onSubmit, onCancel, loading }: FeatureFormProps) {
  const [formData, setFormData] = useState({
    name: feature?.name || '',
    categoryId: feature?.categoryId || '',
    description: feature?.description || '',
    valueType: feature?.valueType || 'string' as ValueType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    if (!formData.valueType) {
      newErrors.valueType = 'Tipo de valor é obrigatório';
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
          placeholder="Ex: Memória RAM, Processador"
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
        <Label htmlFor="valueType">
          Tipo de Valor <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.valueType}
          onValueChange={(value) => setFormData({ ...formData, valueType: value as ValueType })}
          disabled={loading}
        >
          <SelectTrigger id="valueType">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {valueTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.valueType && <p className="text-sm text-destructive">{errors.valueType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição da característica"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : feature ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
