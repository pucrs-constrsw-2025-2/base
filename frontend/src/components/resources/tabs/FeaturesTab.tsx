import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Plus, Search, Filter, Edit, Trash } from 'lucide-react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { FeatureDialog } from '../dialogs/FeatureDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { Feature, Category, CreateFeatureDto, UpdateFeatureDto } from '../../../types/resources';
import { toast } from 'sonner';

const valueTypeLabels: Record<string, string> = {
  string: 'Texto',
  number: 'Número',
  boolean: 'Sim/Não',
  date: 'Data',
};

interface FeaturesTabProps {
  initialCategoryFilter?: string;
}

export function FeaturesTab({ initialCategoryFilter }: FeaturesTabProps = {}) {
  // Mock data
  const [categories] = useState<Category[]>([
    { id: '1', name: 'Notebooks' },
    { id: '2', name: 'Projetores' },
    { id: '3', name: 'Impressoras' },
  ]);

  const [features, setFeatures] = useState<Feature[]>([
    {
      id: '1',
      name: 'Memória RAM',
      categoryId: '1',
      categoryName: 'Notebooks',
      description: 'Quantidade de memória RAM',
      valueType: 'string',
    },
    {
      id: '2',
      name: 'Processador',
      categoryId: '1',
      categoryName: 'Notebooks',
      description: 'Modelo do processador',
      valueType: 'string',
    },
    {
      id: '3',
      name: 'Luminosidade',
      categoryId: '2',
      categoryName: 'Projetores',
      description: 'Luminosidade em lumens',
      valueType: 'number',
    },
    {
      id: '4',
      name: 'WiFi Integrado',
      categoryId: '2',
      categoryName: 'Projetores',
      description: 'Possui WiFi integrado',
      valueType: 'boolean',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | undefined>();
  const [loading, setLoading] = useState(false);

  // Aplicar filtro inicial se fornecido
  useEffect(() => {
    if (initialCategoryFilter) {
      setSelectedCategoryFilter(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  const filteredFeatures = features.filter((feature) => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || feature.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    setSelectedFeature(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (feature: Feature) => {
    setSelectedFeature(feature);
    setDialogOpen(true);
  };

  const handleDelete = (feature: Feature) => {
    setSelectedFeature(feature);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateFeatureDto | UpdateFeatureDto) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedFeature) {
        setFeatures(
          features.map((feat) => {
            if (feat.id === selectedFeature.id) {
              const categoryName =
                categories.find((c) => c.id === (data as any).categoryId)?.name ||
                feat.categoryName;
              return { ...feat, ...data, categoryName };
            }
            return feat;
          })
        );
        toast.success('Feature atualizada com sucesso!');
      } else {
        const categoryName = categories.find((c) => c.id === (data as any).categoryId)?.name;
        const newFeature: Feature = {
          id: Date.now().toString(),
          ...(data as CreateFeatureDto),
          categoryName,
        };
        setFeatures([...features, newFeature]);
        toast.success('Feature criada com sucesso!');
      }

      setDialogOpen(false);
      setSelectedFeature(undefined);
    } catch (error) {
      toast.error('Erro ao salvar feature');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFeature) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFeatures(features.filter((feat) => feat.id !== selectedFeature.id));
      toast.success('Feature excluída com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedFeature(undefined);
    } catch (error) {
      toast.error('Erro ao excluir feature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 items-center">
        <div>
          <h2 className="text-2xl font-semibold">Features</h2>
          <p className="text-muted-foreground">
            Gerencie as características configuráveis dos recursos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Feature
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedCategoryFilter !== 'all'
              ? 'Nenhuma feature encontrada'
              : 'Nenhuma feature cadastrada'}
          </p>
          {!searchTerm && selectedCategoryFilter === 'all' && (
            <Button variant="outline" onClick={handleCreate} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira feature
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {filteredFeatures.map((feature) => (
              <Card key={feature.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{feature.name}</CardTitle>
                      <CardDescription className="text-sm">{feature.categoryName}</CardDescription>
                    </div>
                    <Badge variant="secondary">{valueTypeLabels[feature.valueType]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description || 'Sem descrição'}
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(feature)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(feature)}>
                      <Trash className="w-4 h-4 mr-2 text-destructive" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo de Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell className="font-medium">{feature.name}</TableCell>
                    <TableCell>{feature.categoryName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{valueTypeLabels[feature.valueType]}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {feature.description ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block cursor-help">
                                {feature.description}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{feature.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(feature)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(feature)}
                        >
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Dialogs */}
      <FeatureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        feature={selectedFeature}
        categories={categories}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Feature"
        description="Tem certeza que deseja excluir esta feature? Esta ação não pode ser desfeita."
        itemName={selectedFeature?.name}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
}
