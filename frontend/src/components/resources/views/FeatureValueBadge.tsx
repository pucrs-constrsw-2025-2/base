import { Badge } from '../../ui/badge';
import { Tag } from 'lucide-react';
import { FeatureValue, Feature } from '../../../types/resources';

interface FeatureValueBadgeProps {
  featureValue: FeatureValue;
  feature: Feature;
}

export function FeatureValueBadge({ featureValue, feature }: FeatureValueBadgeProps) {
  const getValue = (): string | number | boolean => {
    if (featureValue.valueString !== undefined && featureValue.valueString !== null) {
      return featureValue.valueString;
    }
    if (featureValue.valueNumber !== undefined && featureValue.valueNumber !== null) {
      return featureValue.valueNumber;
    }
    if (featureValue.valueBoolean !== undefined && featureValue.valueBoolean !== null) {
      return featureValue.valueBoolean;
    }
    return '';
  };

  const formatValue = (value: string | number | boolean, type: string): string => {
    try {
      switch (type.toUpperCase()) {
        case 'BOOLEAN':
          return value ? 'Sim' : 'Não';
        case 'NUMBER':
          return value.toString();
        case 'STRING':
        default:
          return String(value);
      }
    } catch (error) {
      console.error('Error formatting value:', error);
      return String(value);
    }
  };

  const value = getValue();

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
      <Tag className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{feature.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatValue(value, feature.type)}
        </p>
      </div>
      <Badge variant="secondary" className="text-xs">
        {feature.type}
      </Badge>
    </div>
  );
}
