import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Monitor, Edit, Trash, Eye } from 'lucide-react';
import { Resource } from '../../../types/resources';

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onView: (resource: Resource) => void;
}

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  'in-use': 'bg-blue-100 text-blue-800',
  maintenance: 'bg-orange-100 text-orange-800',
  unavailable: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  available: 'Disponível',
  'in-use': 'Em Uso',
  maintenance: 'Manutenção',
  unavailable: 'Indisponível',
};

export function ResourceCard({ resource, onEdit, onDelete, onView }: ResourceCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{resource.name}</CardTitle>
              <CardDescription className="text-sm">
                {resource.categoryName || 'Categoria'}
              </CardDescription>
            </div>
          </div>
          <Badge className={statusColors[resource.status]}>
            {statusLabels[resource.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {resource.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {resource.description}
          </p>
        )}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(resource)}>
            <Eye className="w-4 h-4 mr-2" />
            Detalhes
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(resource)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(resource)}>
            <Trash className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
