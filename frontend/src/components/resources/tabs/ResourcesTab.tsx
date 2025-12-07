import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Plus, Search, Filter, Monitor } from 'lucide-react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ResourceCard } from '../views/ResourceCard';
import { ResourceDialog } from '../dialogs/ResourceDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { ResourceDetailView } from '../views/ResourceDetailView';
import { Resource, Category, CreateResourceDto, UpdateResourceDto, ResourceStatus } from '../../../types/resources';
import { toast } from 'sonner';

interface ResourcesTabProps {
  initialCategoryFilter?: string;
}

export function ResourcesTab({ initialCategoryFilter }: ResourcesTabProps = {}) {
  // Mock data - será substituído por dados reais da API
  const [categories] = useState<Category[]>([
    { id: '1', name: 'Notebooks' },
    { id: '2', name: 'Projetores' },
    { id: '3', name: 'Impressoras' },
  ]);

  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      name: 'Notebook Dell Inspiron 15',
      categoryId: '1',
      categoryName: 'Notebooks',
      description: 'Intel i5, 8GB RAM, 256GB SSD',
      status: 'available',
    },
    {
      id: '2',
      name: 'Notebook Lenovo ThinkPad',
      categoryId: '1',
      categoryName: 'Notebooks',
      description: 'Intel i7, 16GB RAM, 512GB SSD',
      status: 'in-use',
    },
    {
      id: '3',
      name: 'Projetor Epson PowerLite',
      categoryId: '2',
      categoryName: 'Projetores',
      description: '3500 lumens, Full HD',
      status: 'available',
    },
    {
      id: '4',
      name: 'Impressora HP LaserJet',
      categoryId: '3',
      categoryName: 'Impressoras',
      description: 'Monocromática, duplex automático',
      status: 'maintenance',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  const [selectedResourceForDetail, setSelectedResourceForDetail] = useState<Resource | undefined>();
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleView = (resource: Resource) => {
    setSelectedResourceForDetail(resource);
    setShowDetailView(true);
  };

  const handleSubmit = async (data: CreateResourceDto | UpdateResourceDto) => {
    setLoading(true);
    try {
      // TODO: Chamar API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedResource) {
        // Update
        setResources(
          resources.map((res) => {
            if (res.id === selectedResource.id) {
              const categoryName =
                categories.find((c) => c.id === (data as any).categoryId)?.name ||
                res.categoryName;
              return { ...res, ...data, categoryName };
            }
            return res;
          })
        );
        toast.success('Recurso atualizado com sucesso!');
      } else {
        // Create
        const categoryName = categories.find((c) => c.id === (data as any).categoryId)?.name;
        const newResource: Resource = {
          id: Date.now().toString(),
          ...(data as CreateResourceDto),
          categoryName,
        };
        setResources([...resources, newResource]);
        toast.success('Recurso criado com sucesso!');
      }

      setDialogOpen(false);
      setSelectedResource(undefined);
    } catch (error) {
      toast.error('Erro ao salvar recurso');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedResource) return;

    setLoading(true);
    try {
      // TODO: Chamar API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setResources(resources.filter((res) => res.id !== selectedResource.id));
      toast.success('Recurso excluído com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedResource(undefined);
    } catch (error) {
      toast.error('Erro ao excluir recurso');
    } finally {
      setLoading(false);
    }
  };

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
          resource={selectedResourceForDetail}
          featureValues={[]}
          features={[]}
          onEdit={() => {
            setShowDetailView(false);
            handleEdit(selectedResourceForDetail);
          }}
          onDelete={() => {
            setShowDetailView(false);
            handleDelete(selectedResourceForDetail);
          }}
          onAddFeatureValue={() => toast.info('Feature Values em desenvolvimento')}
          onEditFeatureValue={() => {}}
          onDeleteFeatureValue={() => {}}
          onBack={() => setShowDetailView(false)}
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
    </div>
  );
}
