import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Edit, Trash, Plus, ArrowLeft } from 'lucide-react';
import { Resource, FeatureValue, Feature } from '../../../types/resources';
import { FeatureValueBadge } from './FeatureValueBadge';

interface ResourceDetailViewProps {
  resource: Resource;
  featureValues: FeatureValue[];
  features: Feature[];
  onEdit: () => void;
  onDelete: () => void;
  onAddFeatureValue: () => void;
  onEditFeatureValue: (featureValue: FeatureValue) => void;
  onDeleteFeatureValue: (featureValue: FeatureValue) => void;
  onBack: () => void;
}

  const statusColors: Record<string, string> = {
    available: 'bg-green-600 text-white',
    'in-use': 'bg-blue-600 text-white',
    maintenance: 'bg-orange-600 text-white',
    unavailable: 'bg-red-600 text-white',
  };const statusLabels: Record<string, string> = {
  available: 'Disponível',
  'in-use': 'Em Uso',
  maintenance: 'Manutenção',
  unavailable: 'Indisponível',
};

export function ResourceDetailView({
  resource,
  featureValues,
  features,
  onEdit,
  onDelete,
  onAddFeatureValue,
  onEditFeatureValue,
  onDeleteFeatureValue,
  onBack,
}: ResourceDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Recursos
      </Button>

      {/* Resource Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <CardTitle className="text-2xl">{resource.name}</CardTitle>
                <Badge className={statusColors[resource.status]}>
                  {statusLabels[resource.status]}
                </Badge>
              </div>
              <CardDescription>
                Categoria: <span className="font-medium">{resource.categoryName}</span>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onDelete}>
                <Trash className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {resource.description && (
            <>
              <Separator className="mb-4" />
              <div>
                <p className="text-sm font-medium mb-2">Descrição</p>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Feature Values */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Características</CardTitle>
              <CardDescription>
                Valores específicos das características deste recurso
              </CardDescription>
            </div>
            <Button onClick={onAddFeatureValue}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Característica
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {featureValues.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhuma característica adicionada a este recurso
              </p>
              <Button variant="outline" onClick={onAddFeatureValue}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeira característica
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featureValues.map((fv) => {
                const feature = features.find((f) => f.id === fv.featureId);
                if (!feature) return null;

                return (
                  <div key={fv.id} className="relative group">
                    <FeatureValueBadge featureValue={fv} valueType={feature.valueType} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onEditFeatureValue(fv)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onDeleteFeatureValue(fv)}
                      >
                        <Trash className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
