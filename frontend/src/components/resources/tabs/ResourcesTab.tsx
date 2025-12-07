import { useState, useEffect, useRef } from 'react';
import { Button } from '../../ui/button';
import { Plus, Search, Filter, Monitor } from 'lucide-react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ResourceCard } from '../views/ResourceCard';
import { ResourceDialog } from '../dialogs/ResourceDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { FeatureValueDialog } from '../dialogs/FeatureValueDialog';
import { ResourceDetailView, ResourceDetailViewRef } from '../views/ResourceDetailView';
import { Resource, Category, CreateResourceDto, UpdateResourceDto, ResourceStatus, Feature, FeatureValue, CreateFeatureValueDto } from '../../../types/resources';
import { toast } from 'sonner';
import resourcesApiService from '../../../services/api/resources-api.service';

interface ResourcesTabProps {
  initialCategoryFilter?: string;
}

export function ResourcesTab({ initialCategoryFilter }: ResourcesTabProps = {}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureValues, setFeatureValues] = useState<FeatureValue[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [featureValueDialogOpen, setFeatureValueDialogOpen] = useState(false);
  const [deleteFeatureValueDialogOpen, setDeleteFeatureValueDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  const [selectedResourceForDetail, setSelectedResourceForDetail] = useState<Resource | undefined>();
  const [selectedFeatureValue, setSelectedFeatureValue] = useState<FeatureValue | undefined>();
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const detailViewRef = useRef<ResourceDetailViewRef>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      const [categoriesData, resourcesData, featuresData] = await Promise.all([
        resourcesApiService.categories.list(),
        resourcesApiService.resources.list(),
        resourcesApiService.features.list(),
      ]);

      console.log('📦 Categorias carregadas:', categoriesData);
      console.log('📦 Recursos carregados:', resourcesData);

      setCategories(categoriesData);
      setFeatures(featuresData);
      
      // Popular categoryName nos recursos
      const resourcesWithCategoryName = resourcesData.map((resource) => {
        const category = categoriesData.find((c) => c.id === resource.categoryId);
        console.log(`🔍 Recurso ${resource.name} - categoryId: ${resource.categoryId} -> categoria: ${category?.name}`);
        return {
          ...resource,
          categoryName: category?.name,
        };
      });
      
      console.log('📦 Recursos com categoria:', resourcesWithCategoryName);
      setResources(resourcesWithCategoryName);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setInitialLoading(false);
    }
  };

  // Aplicar filtro inicial se fornecido
  useEffect(() => {
    if (initialCategoryFilter) {
      setSelectedCategoryFilter(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || resource.categoryId === selectedCategoryFilter;
    const matchesStatus =
      selectedStatusFilter === 'all' || resource.status === selectedStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = () => {
    setSelectedResource(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setDialogOpen(true);
  };

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource);
    setDeleteDialogOpen(true);
  };

  const handleView = async (resource: Resource) => {
    // Garantir que o categoryName esteja populado
    const resourceWithCategory = {
      ...resource,
      categoryName: resource.categoryName || categories.find((c) => c.id === resource.categoryId)?.name,
    };
    
    console.log('👁️ Visualizando recurso:', resourceWithCategory);
    
    setSelectedResourceForDetail(resourceWithCategory);
    setShowDetailView(true);
  };

  const handleSubmit = async (data: CreateResourceDto | UpdateResourceDto) => {
    setLoading(true);
    try {
      if (selectedResource) {
        // Update
        const updated = await resourcesApiService.resources.patch(selectedResource.id, data);
        const categoryName = categories.find((c) => c.id === updated.categoryId)?.name;
        
        setResources(
          resources.map((res) =>
            res.id === selectedResource.id ? { ...updated, categoryName } : res
          )
        );
        toast.success('Recurso atualizado com sucesso!');
      } else {
        // Create
        const created = await resourcesApiService.resources.create(data as CreateResourceDto);
        const categoryName = categories.find((c) => c.id === created.categoryId)?.name;
        
        console.log('✅ Recurso criado:', created);
        console.log('🏷️ Categoria encontrada:', categoryName);
        
        setResources([...resources, { ...created, categoryName }]);
        toast.success('Recurso criado com sucesso!');
      }

      setDialogOpen(false);
      setSelectedResource(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar recurso');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedResource) return;

    setLoading(true);
    try {
      await resourcesApiService.resources.delete(selectedResource.id);
      setResources(resources.filter((res) => res.id !== selectedResource.id));
      toast.success('Recurso excluído com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedResource(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir recurso');
    } finally {
      setLoading(false);
    }
  };

  // Feature Values handlers
  const handleAddFeatureValue = () => {
    setSelectedFeatureValue(undefined);
    setFeatureValueDialogOpen(true);
  };

  const handleEditFeatureValue = (featureValue: FeatureValue) => {
    setSelectedFeatureValue(featureValue);
    setFeatureValueDialogOpen(true);
  };

  const handleDeleteFeatureValue = (featureValue: FeatureValue) => {
    setSelectedFeatureValue(featureValue);
    setDeleteFeatureValueDialogOpen(true);
  };

  const handleFeatureValueSubmit = async (data: CreateFeatureValueDto) => {
    if (!selectedResourceForDetail) return;

    setLoading(true);
    try {
      if (selectedFeatureValue) {
        // Update - usar método patch simples
        await resourcesApiService.featureValues.patch(selectedFeatureValue.id, data);
        toast.success('Característica atualizada com sucesso!');
      } else {
        // Create - usar método create com resourceId incluído
        const dataWithResourceId = {
          ...data,
          resourceId: selectedResourceForDetail.id,
        };
        await resourcesApiService.featureValues.create(dataWithResourceId);
        toast.success('Característica adicionada com sucesso!');
      }
      
      // Recarregar feature values no detalhe
      await detailViewRef.current?.reloadFeatureValues();
      
      setFeatureValueDialogOpen(false);
      setSelectedFeatureValue(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar característica');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteFeatureValue = async () => {
    if (!selectedResourceForDetail || !selectedFeatureValue) return;

    setLoading(true);
    try {
      // Usar método delete simples
      await resourcesApiService.featureValues.delete(selectedFeatureValue.id);
      toast.success('Característica removida com sucesso!');
      
      // Recarregar feature values no detalhe
      await detailViewRef.current?.reloadFeatureValues();
      
      setDeleteFeatureValueDialogOpen(false);
      setSelectedFeatureValue(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover característica');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando recursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 items-center">
        <div>
          <h2 className="text-2xl font-semibold">Recursos</h2>
          <p className="text-muted-foreground">
            Gerencie os recursos computacionais disponíveis
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Recurso
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Categoria" />
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
        <div className="w-full sm:w-[200px]">
          <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="in-use">Em Uso</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="unavailable">Indisponível</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {showDetailView && selectedResourceForDetail ? (
        <ResourceDetailView
          ref={detailViewRef}
          resource={selectedResourceForDetail}
          features={features}
          onEdit={() => {
            setShowDetailView(false);
            handleEdit(selectedResourceForDetail);
          }}
          onDelete={() => {
            setShowDetailView(false);
            handleDelete(selectedResourceForDetail);
          }}
          onAddFeatureValue={handleAddFeatureValue}
          onEditFeatureValue={handleEditFeatureValue}
          onDeleteFeatureValue={handleDeleteFeatureValue}
          onBack={() => setShowDetailView(false)}
          onFeatureValuesChange={setFeatureValues}
        />
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">
            {searchTerm || selectedCategoryFilter !== 'all' || selectedStatusFilter !== 'all'
              ? 'Nenhum recurso encontrado'
              : 'Nenhum recurso cadastrado'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || selectedCategoryFilter !== 'all' || selectedStatusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando seu primeiro recurso computacional'}
          </p>
          {!searchTerm && selectedCategoryFilter === 'all' && selectedStatusFilter === 'all' && (
            <Button variant="outline" onClick={handleCreate} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro recurso
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={selectedResource}
        categories={categories}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Recurso"
        description="Tem certeza que deseja excluir este recurso? Esta ação não pode ser desfeita."
        itemName={selectedResource?.name}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />

      <FeatureValueDialog
        open={featureValueDialogOpen}
        onOpenChange={setFeatureValueDialogOpen}
        featureValue={selectedFeatureValue}
        features={features}
        resourceId={selectedResourceForDetail?.id}
        onSubmit={handleFeatureValueSubmit}
        loading={loading}
      />

      <DeleteConfirmDialog
        open={deleteFeatureValueDialogOpen}
        onOpenChange={setDeleteFeatureValueDialogOpen}
        title="Remover Característica"
        description="Tem certeza que deseja remover esta característica do recurso?"
        itemName={features.find(f => f.id === selectedFeatureValue?.featureId)?.name}
        onConfirm={handleConfirmDeleteFeatureValue}
        loading={loading}
      />
    </div>
  );
}
