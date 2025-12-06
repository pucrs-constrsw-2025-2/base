import { useState } from 'react';
import { Button } from '../../ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { CategoryCard } from '../views/CategoryCard';
import { CategoryDialog } from '../dialogs/CategoryDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../types/resources';
import { toast } from 'sonner';

export function CategoriesTab() {
  // Mock data - será substituído por dados reais da API
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Notebooks',
      description: 'Computadores portáteis para trabalho e estudos',
    },
    {
      id: '2',
      name: 'Projetores',
      description: 'Equipamentos de projeção para apresentações',
    },
    {
      id: '3',
      name: 'Impressoras',
      description: 'Dispositivos de impressão e digitalização',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [loading, setLoading] = useState(false);

  // Mock counts - será substituído por dados reais
  const getResourceCount = (categoryId: string) => {
    const counts: Record<string, number> = { '1': 15, '2': 8, '3': 12 };
    return counts[categoryId] || 0;
  };

  const getFeatureCount = (categoryId: string) => {
    const counts: Record<string, number> = { '1': 5, '2': 3, '3': 4 };
    return counts[categoryId] || 0;
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    toast.info(`Visualizar recursos da categoria: ${category.name}`);
    // TODO: Navegar para aba de recursos com filtro
  };

  const handleViewFeatures = (category: Category) => {
    toast.info(`Visualizar features da categoria: ${category.name}`);
    // TODO: Navegar para aba de features com filtro
  };

  const handleSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    setLoading(true);
    try {
      // TODO: Chamar API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedCategory) {
        // Update
        setCategories(
          categories.map((cat) =>
            cat.id === selectedCategory.id ? { ...cat, ...data } : cat
          )
        );
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Create
        const newCategory: Category = {
          id: Date.now().toString(),
          ...data,
        };
        setCategories([...categories, newCategory]);
        toast.success('Categoria criada com sucesso!');
      }

      setDialogOpen(false);
      setSelectedCategory(undefined);
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      // TODO: Chamar API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      toast.success('Categoria excluída com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedCategory(undefined);
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
