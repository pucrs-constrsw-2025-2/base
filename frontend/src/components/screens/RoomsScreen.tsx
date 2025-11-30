import { useEffect, useState } from 'react';
import { 
  getRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom, 
  Room, 
  CreateRoomDto,
  RoomStatus
} from '../../services/rooms.service';

// Componentes UI
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Building, Search } from 'lucide-react';

export function RoomsScreen() {
  // --- Estados ---
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filtros simples
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do formulário
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<CreateRoomDto>({
    number: '',
    building: '',
    category: '',
    capacity: 0,
    floor: 0,
    description: '',
    status: 'ACTIVE'
  });

  // --- Carregamento de Dados ---
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      // Busca inicial. Em produção, implementar paginação real via params
      const response = await getRooms({ limit: 100 });
      setRooms(response.items || []);
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar a lista de salas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // --- Handlers ---

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        number: room.number,
        building: room.building,
        category: room.category,
        capacity: room.capacity,
        floor: room.floor,
        description: room.description || '',
        status: room.status
      });
    } else {
      setEditingRoom(null);
      setFormData({
        number: '',
        building: '',
        category: '',
        capacity: 0,
        floor: 0,
        description: '',
        status: 'ACTIVE'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Ajuste de tipos antes de enviar
      const payload: CreateRoomDto = {
        ...formData,
        capacity: Number(formData.capacity),
        floor: Number(formData.floor)
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, payload);
        toast.success('Sala atualizada com sucesso!');
      } else {
        await createRoom(payload);
        toast.success('Sala criada com sucesso!');
      }
      
      setIsDialogOpen(false);
      fetchRooms(); // Recarrega a lista
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar sala.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta sala? Esta ação não pode ser desfeita.')) return;
    
    try {
      await deleteRoom(id);
      toast.success('Sala removida com sucesso.');
      fetchRooms();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir sala.');
    }
  };

  // Filtragem local simples para feedback imediato
  const filteredRooms = rooms.filter(room => 
    room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Renderização ---
  return (
    <div className="p-4 md:p-6 w-full space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Salas</h2>
          <p className="text-muted-foreground">
            Gerencie as salas, laboratórios e espaços da instituição.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Sala
        </Button>
      </div>

      {/* Conteúdo Principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>Listagem de Salas</CardTitle>
            <CardDescription>
              Visualize todos os espaços cadastrados.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sala..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando salas...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-dashed border-2 rounded-lg">
              <div className="flex justify-center mb-4">
                <Building className="h-12 w-12 opacity-20" />
              </div>
              <p>Nenhuma sala encontrada.</p>
              {searchTerm && <p className="text-sm">Tente limpar o filtro de busca.</p>}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número/Nome</TableHead>
                    <TableHead>Prédio</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Andar</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.number}</TableCell>
                      <TableCell>{room.building}</TableCell>
                      <TableCell>{room.category}</TableCell>
                      <TableCell>{room.floor}º</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <StatusBadge status={room.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenDialog(room)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDelete(room.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da sala abaixo. Todos os campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número/Nome *</Label>
                <Input 
                  id="number" 
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  placeholder="Ex: 101, Lab A" 
                  maxLength={20}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building">Prédio *</Label>
                <Input 
                  id="building" 
                  value={formData.building}
                  onChange={(e) => setFormData({...formData, building: e.target.value})}
                  placeholder="Ex: 32" 
                  maxLength={10}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Input 
                  id="category" 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Ex: Sala de Aula" 
                  maxLength={10}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Andar *</Label>
                <Input 
                  id="floor" 
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value) || 0})}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade *</Label>
                <Input 
                  id="capacity" 
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: RoomStatus) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativa</SelectItem>
                    <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                    <SelectItem value="INACTIVE">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detalhes opcionais sobre equipamentos, ar-condicionado, etc." 
                maxLength={255}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente auxiliar simples para renderizar o badge de status
function StatusBadge({ status }: { status: RoomStatus }) {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-700 border-green-200',
    MAINTENANCE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const labels = {
    ACTIVE: 'Ativa',
    MAINTENANCE: 'Manutenção',
    INACTIVE: 'Inativa'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.INACTIVE}`}>
      {labels[status] || status}
    </span>
  );
}
