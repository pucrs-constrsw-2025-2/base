import { Badge } from '../../ui/badge';
import { Tag } from 'lucide-react';
import { FeatureValue, ValueType } from '../../../types/resources';

interface FeatureValueBadgeProps {
  featureValue: FeatureValue;
  valueType: ValueType;
}

export function FeatureValueBadge({ featureValue, valueType }: FeatureValueBadgeProps) {
  const formatValue = (value: string | number | boolean | Date, type: ValueType): string => {
    switch (type) {
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'number':
        return value.toString();
      default:
        return String(value);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
      <Tag className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{featureValue.featureName || 'Feature'}</p>
        <p className="text-xs text-muted-foreground">
          {formatValue(featureValue.value, valueType)}
        </p>
      </div>
      <Badge variant="secondary" className="text-xs">
        {valueType}
      </Badge>
    </div>
  );
}
