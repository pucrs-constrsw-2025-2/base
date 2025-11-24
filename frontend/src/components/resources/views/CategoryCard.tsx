import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Folder, Edit, Trash, List, Settings } from 'lucide-react';
import { Category } from '../../../types/resources';

interface CategoryCardProps {
  category: Category;
  resourceCount?: number;
  featureCount?: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onViewResources: (category: Category) => void;
  onViewFeatures: (category: Category) => void;
}

export function CategoryCard({
  category,
  resourceCount = 0,
  featureCount = 0,
  onEdit,
  onDelete,
  onViewResources,
  onViewFeatures,
}: CategoryCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription className="text-sm">
                {category.description || 'Sem descrição'}
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(category)}>
              <Trash className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <div>
              <p className="text-2xl font-bold text-primary">{resourceCount}</p>
              <p className="text-xs text-muted-foreground">Recursos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{featureCount}</p>
              <p className="text-xs text-muted-foreground">Features</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewResources(category)}
          >
            <List className="w-4 h-4 mr-2" />
            Ver Recursos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewFeatures(category)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Ver Features
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
