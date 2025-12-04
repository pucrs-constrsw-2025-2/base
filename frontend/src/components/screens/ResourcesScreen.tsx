import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { 
  Monitor, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  FolderOpen,
  Tag,
  Package
} from 'lucide-react';
import { 
  categoriesService, 
  resourcesService, 
  featuresService,
} from '../../services/resourcesService';
import type { 
  Category, 
  Resource, 
  Feature,
  CreateResourceDto,
  UpdateResourceDto,
  CreateCategoryDto,
  CreateFeatureDto,
  ValueType
} from '../../types/resources';

export function ResourcesScreen() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Dialog states
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  
  // Form states
  const [resourceForm, setResourceForm] = useState<CreateResourceDto>({
    name: '',
    quantity: 0,
    status: true,
    categoryId: '',
  });
  const [categoryForm, setCategoryForm] = useState<CreateCategoryDto>({
    name: '',
  });
  const [featureForm, setFeatureForm] = useState<CreateFeatureDto>({
    name: '',
    type: 'STRING' as ValueType,
    categoryId: '',
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock data para teste (remover quando API estiver funcionando)
      const mockCategories: Category[] = [
        { _id: '1', name: 'Equipamentos de Informática' },
        { _id: '2', name: 'Equipamentos Audiovisuais' },
        { _id: '3', name: 'Equipamentos de Laboratório' },
      ];
      
      const mockResources: Resource[] = [
        { _id: 'r1', name: 'Notebook Dell Latitude 5420', quantity: 10, status: true, categoryId: '1' },
        { _id: 'r2', name: 'Projetor Sony VPL-FHZ70', quantity: 5, status: true, categoryId: '2' },
        { _id: 'r3', name: 'Microscópio Olympus CX23', quantity: 3, status: true, categoryId: '3' },
        { _id: 'r4', name: 'Desktop HP ProDesk 400', quantity: 15, status: true, categoryId: '1' },
        { _id: 'r5', name: 'Projetor Epson EB-2250U', quantity: 2, status: false, categoryId: '2' },
      ];
      
      const mockFeatures: Feature[] = [
        { _id: 'f1', name: 'Processador', type: 'STRING', categoryId: '1' },
        { _id: 'f2', name: 'Memória RAM (GB)', type: 'NUMBER', categoryId: '1' },
        { _id: 'f3', name: 'Resolução', type: 'STRING', categoryId: '2' },
        { _id: 'f4', name: 'Portátil', type: 'BOOLEAN', categoryId: '2' },
      ];
      
      setCategories(mockCategories);
      setResources(mockResources);
      setFeatures(mockFeatures);
      
      // Código original comentado temporariamente
      // const [categoriesData, resourcesData, featuresData] = await Promise.all([
      //   categoriesService.getAll(),
      //   resourcesService.getAll(),
      //   featuresService.getAll(),
      // ]);
      // setCategories(categoriesData);
      // setResources(resourcesData);
      // setFeatures(featuresData);
    } catch (error) {
      toast.error('Erro ao carregar dados: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Category functions
  const handleCreateCategory = async () => {
    try {
      // Mock: adicionar localmente
      const newCategory: Category = {
        _id: Date.now().toString(),
        name: categoryForm.name,
      };
      setCategories([...categories, newCategory]);
      toast.success('Categoria criada com sucesso!');
      setCategoryForm({ name: '' });
      setIsCategoryDialogOpen(false);
      
      // await categoriesService.create(categoryForm);
      // loadData();
    } catch (error) {
      toast.error('Erro ao criar categoria: ' + (error as Error).message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      // Mock: remover localmente
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Categoria excluída com sucesso!');
      
      // await categoriesService.delete(id);
      // loadData();
    } catch (error) {
      toast.error('Erro ao excluir categoria: ' + (error as Error).message);
    }
  };

  // Feature functions
  const handleCreateFeature = async () => {
    try {
      // Mock: adicionar localmente
      const newFeature: Feature = {
        _id: Date.now().toString(),
        name: featureForm.name,
        type: featureForm.type,
        categoryId: featureForm.categoryId,
      };
      setFeatures([...features, newFeature]);
      toast.success('Característica criada com sucesso!');
      setFeatureForm({ name: '', type: 'STRING' as ValueType, categoryId: '' });
      setIsFeatureDialogOpen(false);
      
      // await featuresService.create(featureForm);
      // loadData();
    } catch (error) {
      toast.error('Erro ao criar característica: ' + (error as Error).message);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta característica?')) return;
    try {
      // Mock: remover localmente
      setFeatures(features.filter(f => f._id !== id));
      toast.success('Característica excluída com sucesso!');
      
      // await featuresService.delete(id);
      // loadData();
    } catch (error) {
      toast.error('Erro ao excluir característica: ' + (error as Error).message);
    }
  };

  // Resource functions
  const handleCreateOrUpdateResource = async () => {
    try {
      if (editingResource) {
        // Mock: atualizar localmente
        const updatedResources = resources.map(r =>
          r._id === editingResource._id
            ? { ...r, ...resourceForm }
            : r
        );
        setResources(updatedResources);
        toast.success('Recurso atualizado com sucesso!');
        
        // await resourcesService.update(editingResource._id, resourceForm);
      } else {
        // Mock: adicionar localmente
        const newResource: Resource = {
          _id: Date.now().toString(),
          ...resourceForm,
        };
        setResources([...resources, newResource]);
        toast.success('Recurso criado com sucesso!');
        
        // await resourcesService.create(resourceForm);
      }
      setResourceForm({ name: '', quantity: 0, status: true, categoryId: '' });
      setEditingResource(null);
      setIsResourceDialogOpen(false);
      // loadData();
    } catch (error) {
      toast.error('Erro ao salvar recurso: ' + (error as Error).message);
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setResourceForm({
      name: resource.name,
      quantity: resource.quantity,
      status: resource.status,
      categoryId: typeof resource.categoryId === 'string' ? resource.categoryId : resource.categoryId._id,
    });
    setIsResourceDialogOpen(true);
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este recurso?')) return;
    try {
      // Mock: remover localmente
      setResources(resources.filter(r => r._id !== id));
      toast.success('Recurso excluído com sucesso!');
      
      // await resourcesService.delete(id);
      // loadData();
    } catch (error) {
      toast.error('Erro ao excluir recurso: ' + (error as Error).message);
    }
  };

  const getCategoryName = (categoryId: string | Category): string => {
    if (typeof categoryId === 'object' && categoryId !== null) {
      return categoryId.name;
    }
    const category = categories.find(c => c._id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(r => {
        const catId = typeof r.categoryId === 'string' ? r.categoryId : r.categoryId._id;
        return catId === selectedCategory;
      });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Monitor className="w-8 h-8" />
            Recursos Computacionais
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie recursos, categorias e características
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Recursos</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Características</CardTitle>
            <Tag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{features.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="features">Características</TabsTrigger>
        </TabsList>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Recursos</CardTitle>
                  <CardDescription>Gerencie os recursos computacionais disponíveis</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => {
                    setEditingResource(null);
                    setResourceForm({ name: '', quantity: 0, status: true, categoryId: '' });
                    setIsResourceDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Recurso
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum recurso encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResources.map(resource => (
                      <TableRow key={resource._id}>
                        <TableCell className="font-medium">{resource.name}</TableCell>
                        <TableCell>{getCategoryName(resource.categoryId)}</TableCell>
                        <TableCell>{resource.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={resource.status ? 'default' : 'secondary'}>
                            {resource.status ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditResource(resource)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteResource(resource._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>Organize recursos por categorias</CardDescription>
                </div>
                <Button onClick={() => setIsCategoryDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Recursos</TableHead>
                    <TableHead>Características</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma categoria encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map(category => {
                      const resourceCount = resources.filter(r => {
                        const catId = typeof r.categoryId === 'string' ? r.categoryId : r.categoryId._id;
                        return catId === category._id;
                      }).length;
                      const featureCount = features.filter(f => {
                        const catId = typeof f.categoryId === 'string' ? f.categoryId : f.categoryId._id;
                        return catId === category._id;
                      }).length;
                      
                      return (
                        <TableRow key={category._id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{resourceCount}</TableCell>
                          <TableCell>{featureCount}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteCategory(category._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Características</CardTitle>
                  <CardDescription>Defina características para os recursos</CardDescription>
                </div>
                <Button onClick={() => setIsFeatureDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Característica
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma característica encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    features.map(feature => (
                      <TableRow key={feature._id}>
                        <TableCell className="font-medium">{feature.name}</TableCell>
                        <TableCell>{getCategoryName(feature.categoryId)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{feature.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteFeature(feature._id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resource Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Editar Recurso' : 'Novo Recurso'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do recurso computacional
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resource-name">Nome</Label>
              <Input 
                id="resource-name"
                value={resourceForm.name}
                onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                placeholder="Ex: Notebook Dell Latitude"
              />
            </div>
            <div>
              <Label htmlFor="resource-category">Categoria</Label>
              <Select 
                value={resourceForm.categoryId} 
                onValueChange={(value) => setResourceForm({ ...resourceForm, categoryId: value })}
              >
                <SelectTrigger id="resource-category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resource-quantity">Quantidade</Label>
              <Input 
                id="resource-quantity"
                type="number"
                min="0"
                value={resourceForm.quantity}
                onChange={(e) => setResourceForm({ ...resourceForm, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="resource-status"
                checked={resourceForm.status}
                onCheckedChange={(checked) => setResourceForm({ ...resourceForm, status: checked })}
              />
              <Label htmlFor="resource-status">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrUpdateResource}>
              {editingResource ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar recursos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nome</Label>
              <Input 
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                placeholder="Ex: Equipamentos de Informática"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Dialog */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Característica</DialogTitle>
            <DialogDescription>
              Crie uma nova característica para recursos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feature-name">Nome</Label>
              <Input 
                id="feature-name"
                value={featureForm.name}
                onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                placeholder="Ex: Memória RAM"
              />
            </div>
            <div>
              <Label htmlFor="feature-category">Categoria</Label>
              <Select 
                value={featureForm.categoryId} 
                onValueChange={(value) => setFeatureForm({ ...featureForm, categoryId: value })}
              >
                <SelectTrigger id="feature-category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feature-type">Tipo de Valor</Label>
              <Select 
                value={featureForm.type} 
                onValueChange={(value) => setFeatureForm({ ...featureForm, type: value as ValueType })}
              >
                <SelectTrigger id="feature-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRING">Texto</SelectItem>
                  <SelectItem value="NUMBER">Número</SelectItem>
                  <SelectItem value="BOOLEAN">Sim/Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeatureDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFeature}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}