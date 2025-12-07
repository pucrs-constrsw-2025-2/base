import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { CreateFeatureValueDto, UpdateFeatureValueDto, Feature, ValueType } from '../../../types/resources';

interface FeatureValueFormProps {
  featureValue?: any;
  features: Feature[];
  onSubmit: (data: CreateFeatureValueDto | UpdateFeatureValueDto) => void;
  onCancel: () => void;
  loading?: boolean;
  preselectedFeatureId?: string;
  preselectedResourceId?: string;
}

export function FeatureValueForm({
  featureValue,
  features,
  onSubmit,
  onCancel,
  loading,
  preselectedFeatureId,
  preselectedResourceId,
}: FeatureValueFormProps) {
  const [selectedFeatureId, setSelectedFeatureId] = useState(
    featureValue?.featureId || preselectedFeatureId || ''
  );
  const [value, setValue] = useState<string | number | boolean>(
    featureValue?.value !== undefined ? featureValue.value : ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedFeature = features.find((f) => f.id === selectedFeatureId);
  const valueType: ValueType = selectedFeature?.valueType || 'string';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedFeatureId) {
      newErrors.feature = 'Feature é obrigatória';
    }

    if (valueType === 'number' && isNaN(Number(value))) {
      newErrors.value = 'Valor deve ser um número';
    }

    if (valueType === 'string' && !String(value).trim()) {
      newErrors.value = 'Valor é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submitData: any = {
        featureId: selectedFeatureId,
        value: valueType === 'number' ? Number(value) : value,
      };

      if (preselectedResourceId) {
        submitData.resourceId = preselectedResourceId;
      }

      onSubmit(submitData);
    }
  };

  const renderValueInput = () => {
    switch (valueType) {
      case 'boolean':
        return (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">
                  {value ? 'Ativado' : 'Desativado'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {value ? 'Clique para desativar' : 'Clique para ativar'}
                </p>
              </div>
              <Switch
                checked={Boolean(value)}
                onCheckedChange={(checked) => setValue(checked)}
                disabled={loading}
              />
            </div>
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Digite um número"
            disabled={loading}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Digite o valor"
            disabled={loading}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="feature">
          Característica <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedFeatureId}
          onValueChange={setSelectedFeatureId}
          disabled={loading || !!preselectedFeatureId}
        >
          <SelectTrigger id="feature">
            <SelectValue placeholder="Selecione uma característica" />
          </SelectTrigger>
          <SelectContent>
            {features.map((feature) => (
              <SelectItem key={feature.id} value={feature.id}>
                {feature.name} ({feature.valueType})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.feature && <p className="text-sm text-destructive">{errors.feature}</p>}
      </div>

      {selectedFeature && (
        <div className="space-y-2">
          <Label htmlFor="value">
            Valor <span className="text-destructive">*</span>
          </Label>
          {renderValueInput()}
          {errors.value && <p className="text-sm text-destructive">{errors.value}</p>}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !selectedFeature}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Salvando...' : featureValue ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
}
