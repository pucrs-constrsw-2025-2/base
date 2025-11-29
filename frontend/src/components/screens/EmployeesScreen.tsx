import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Briefcase,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
  type EmployeeCreateRequest,
  type EmployeeUpdateRequest,
} from '../../services/employees.service';
import { getRooms, getRoomById, type Room } from '../../services/rooms.service';

export function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size] = useState(10); // BFF usa 'size', não 'limit'
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<EmployeeCreateRequest>({
    contract_number: 0,
    name: '',
    role: '',
    salary: undefined,
    organizational_unit: '',
    room: undefined,
  });

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getEmployees({
        page,
        size,
        search: searchTerm || undefined,
      });
      setEmployees(response.employees || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar funcionários'
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Resetar para primeira página ao buscar
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setSelectedRoom(null);
    setFormData({
      contract_number: 0,
      name: '',
      role: '',
      salary: undefined,
      organizational_unit: '',
      room: undefined,
    });
    setIsDialogOpen(true);
  };

  const handleOpenRoomDialog = async () => {
    setIsRoomDialogOpen(true);
    setLoadingRooms(true);
    try {
      const response = await getRooms({ limit: 100 });
      // O BFF pode retornar items diretamente ou dentro de data
      const roomsList = response.items || (Array.isArray(response) ? response : []);
      setRooms(roomsList);
    } catch (error) {
      console.error('Erro ao carregar salas:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar salas'
      );
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      ...formData,
      room: { idRoom: room.id },
    });
    setIsRoomDialogOpen(false);
    toast.success(`Sala ${room.building} - ${room.number} selecionada`);
  };

  const handleEdit = async (employee: Employee) => {
    try {
      setLoading(true);
      const fullEmployee = await getEmployeeById(employee._id);
      setSelectedEmployee(fullEmployee);
      setFormData({
        contract_number: fullEmployee.contract_number,
        name: fullEmployee.name,
        role: fullEmployee.role,
        salary: fullEmployee.salary,
        organizational_unit: fullEmployee.organizational_unit || '',
        room: fullEmployee.room,
      });
      
      // Carregar dados da sala se houver room.idRoom
      if (fullEmployee.room?.idRoom) {
        try {
          const roomData = await getRoomById(fullEmployee.room.idRoom);
          setSelectedRoom(roomData);
        } catch (error) {
          console.error('Erro ao carregar dados da sala:', error);
          setSelectedRoom(null);
        }
      } else {
        setSelectedRoom(null);
      }
      
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar funcionário:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar funcionário'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;

    try {
      setIsSubmitting(true);
      await deleteEmployee(selectedEmployee._id);
      toast.success('Funcionário excluído com sucesso');
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao excluir funcionário'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contract_number || !formData.name || !formData.role) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (selectedEmployee) {
        // Atualizar
        const updateData: EmployeeUpdateRequest = {
          contract_number: formData.contract_number,
          name: formData.name,
          role: formData.role,
          salary: formData.salary,
          organizational_unit: formData.organizational_unit || undefined,
          room: formData.room,
        };
        await updateEmployee(selectedEmployee._id, updateData);
        toast.success('Funcionário atualizado com sucesso');
      } else {
        // Criar
        const createData: EmployeeCreateRequest = {
          contract_number: formData.contract_number,
          name: formData.name,
          role: formData.role,
          salary: formData.salary,
          organizational_unit: formData.organizational_unit || undefined,
          room: formData.room,
        };
        await createEmployee(createData);
        toast.success('Funcionário criado com sucesso');
      }
      
      setIsDialogOpen(false);
      setSelectedEmployee(null);
      setSelectedRoom(null);
      loadEmployees();
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar funcionário'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Cadastro de Funcionários</CardTitle>
              </div>
              <CardDescription>
                Gerencie o cadastro de funcionários do sistema
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <Search className="text-muted-foreground w-4 h-4" />
              </div>
              <Input
                placeholder="Buscar por nome, número de contrato ou unidade organizacional..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-[2.75rem] px-6"
              />
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Nenhum funcionário encontrado com os critérios de busca'
                  : 'Nenhum funcionário cadastrado'}
              </p>
            </div>
            ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Contrato</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Salário</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee._id}>
                        <TableCell className="font-medium">
                          {employee.contract_number}
                        </TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {employee.organizational_unit || '-'}
                        </TableCell>
                        <TableCell>
                          {employee.salary
                            ? `R$ ${employee.salary.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(employee)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(employee)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((page - 1) * size) + 1} a{' '}
                    {Math.min(page * size, total)} de {total} funcionários
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        Página {page} de {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee
                ? 'Atualize as informações do funcionário'
                : 'Preencha os dados para criar um novo funcionário'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contract_number">
                  Número de Contrato <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contract_number"
                  type="number"
                  value={formData.contract_number || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contract_number: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">
                  Cargo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salary">Salário</Label>
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  value={formData.salary || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salary: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="organizational_unit">
                  Unidade Organizacional
                </Label>
                <Input
                  id="organizational_unit"
                  value={formData.organizational_unit || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizational_unit: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Sala</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="room_building" className="text-sm text-muted-foreground">
                        Prédio
                      </Label>
                      <Input
                        id="room_building"
                        value={selectedRoom?.building || ''}
                        disabled
                        placeholder="Nenhuma sala selecionada"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="room_number" className="text-sm text-muted-foreground">
                        Número
                      </Label>
                      <Input
                        id="room_number"
                        value={selectedRoom?.number || ''}
                        disabled
                        placeholder="Nenhuma sala selecionada"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenRoomDialog}
                    className="w-full"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Buscar Sala
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  if (!selectedEmployee) {
                    setSelectedRoom(null);
                  }
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {selectedEmployee ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funcionário{' '}
              <strong>{selectedEmployee?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Seleção de Salas */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Sala</DialogTitle>
            <DialogDescription>
              Selecione uma sala da lista abaixo
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma sala encontrada
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prédio</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Capacidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow
                        key={room.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSelectRoom(room)}
                      >
                        <TableCell className="font-medium">
                          {room.building}
                        </TableCell>
                        <TableCell>{room.number}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{room.category}</Badge>
                        </TableCell>
                        <TableCell>{room.capacity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRoomDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

