import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { CategoryCard } from '../views/CategoryCard';
import { CategoryDialog } from '../dialogs/CategoryDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { Category, CreateCategoryDto, UpdateCategoryDto, Resource, Feature } from '../../../types/resources';
import { toast } from 'sonner';
import resourcesApiService from '../../../services/api/resources-api.service';

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
      
      setCategories(categoriesData);
      setResources(resourcesData);
      setFeatures(featuresData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setInitialLoading(false);
    }
  };

  // Contar recursos e features por categoria
  const getResourceCount = (categoryId: string) => {
    return resources.filter((r) => r.categoryId === categoryId).length;
  };

  const getFeatureCount = (categoryId: string) => {
    return features.filter((f) => f.categoryId === categoryId).length;
  };

  const filteredCategories = categories
    .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const handleCreate = () => {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleViewResources = (category: Category) => {
    // Disparar evento para navegar para ResourcesTab com filtro
    const event = new CustomEvent('navigateToResources', {
      detail: { categoryFilter: category.id },
    });
    window.dispatchEvent(event);
  };

  const handleViewFeatures = (category: Category) => {
    // Disparar evento para navegar para FeaturesTab com filtro
    const event = new CustomEvent('navigateToFeatures', {
      detail: { categoryFilter: category.id },
    });
    window.dispatchEvent(event);
  };

  const handleSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    setLoading(true);
    try {
      if (selectedCategory) {
        // Update
        const updated = await resourcesApiService.categories.patch(selectedCategory.id, data);
        setCategories(categories.map((cat) => (cat.id === selectedCategory.id ? updated : cat)));
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Create
        const created = await resourcesApiService.categories.create(data as CreateCategoryDto);
        setCategories([...categories, created]);
        toast.success('Categoria criada com sucesso!');
      }

      setDialogOpen(false);
      setSelectedCategory(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      await resourcesApiService.categories.delete(selectedCategory.id);
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      toast.success('Categoria excluída com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedCategory(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir categoria');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Categorias</h2>
          <p className="text-muted-foreground">
            Gerencie as categorias de recursos computacionais
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name-asc' | 'name-desc')}>
          <SelectTrigger className="w-[200px] h-10">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
          </p>
          {!searchTerm && (
            <Button variant="outline" onClick={handleCreate} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira categoria
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              resourceCount={getResourceCount(category.id)}
              featureCount={getFeatureCount(category.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewResources={handleViewResources}
              onViewFeatures={handleViewFeatures}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Categoria"
        description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
        itemName={selectedCategory?.name}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
}
