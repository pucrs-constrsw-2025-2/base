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
  CheckSquare,
  Calendar,
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
import {
  getEmployeeTasks,
  getEmployeeTask,
  createEmployeeTask,
  updateEmployeeTask,
  deleteEmployeeTask,
  type Task,
  type TaskCreateRequest,
  type TaskUpdateRequest,
} from '../../services/tasks.service';

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
  
  // Estados para gerenciamento de tasks
  const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [taskFormData, setTaskFormData] = useState<TaskCreateRequest>({
    description: '',
    startDate: '',
    expectedEndDate: '',
    actualEndDate: undefined,
  });
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskEndDate, setTaskEndDate] = useState('');

  // Função auxiliar para extrair o ID da sala de diferentes formatos
  const extractRoomId = useCallback((room: any): string | null => {
    if (!room) return null;
    
    // Se for string, retornar diretamente
    if (typeof room === 'string' && room.trim() !== '') {
      return room.trim();
    }
    
    // Se for objeto, tentar todas as variações possíveis
    if (typeof room === 'object' && room !== null) {
      return room.idRoom || 
             room.id || 
             room._id ||
             room._idRoom ||
             room.id_room ||
             (room as any).roomId ||
             null;
    }
    
    return null;
  }, []);

  // Função auxiliar para carregar dados da sala
  const loadRoomData = useCallback(async (roomId: string): Promise<Room | null> => {
    try {
      console.log('Carregando dados da sala com ID:', roomId);
      const roomData = await getRoomById(roomId);
      console.log('Dados da sala carregados:', roomData);
      
      // Normalizar os dados da sala para aceitar tanto id quanto _id
      const normalizedRoom: Room | null = roomData ? {
        ...roomData,
        id: (roomData as any).id || (roomData as any)._id || roomId,
      } : null;
      
      // Validar se os dados essenciais estão presentes
      if (normalizedRoom && normalizedRoom.id && normalizedRoom.building && normalizedRoom.number) {
        return normalizedRoom;
      }
      
      console.warn('Dados da sala incompletos ou inválidos:', roomData);
      return null;
    } catch (error) {
      console.error('Erro ao carregar dados da sala:', error);
      if (error instanceof Error) {
        console.error('Mensagem de erro:', error.message);
        console.error('Stack:', error.stack);
      }
      return null;
    }
  }, []);

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

  // Monitorar mudanças no selectedRoom para debug
  useEffect(() => {
    console.log('=== selectedRoom mudou ===');
    console.log('selectedRoom:', selectedRoom);
    console.log('selectedRoom?.building:', selectedRoom?.building);
    console.log('selectedRoom?.number:', selectedRoom?.number);
    console.log('selectedRoom (JSON):', JSON.stringify(selectedRoom, null, 2));
  }, [selectedRoom]);

  // Recarregar dados da sala quando o dialog de edição abrir e houver um employee selecionado
  useEffect(() => {
    if (isDialogOpen && selectedEmployee) {
      console.log('useEffect: Dialog aberto com employee selecionado');
      console.log('selectedEmployee.room:', selectedEmployee.room);
      const roomId = extractRoomId(selectedEmployee.room);
      if (roomId) {
        console.log('useEffect: ID da sala encontrado:', roomId);
        // Sempre tentar carregar a sala, mesmo se selectedRoom já existir
        // Isso garante que os dados estejam atualizados
        loadRoomData(roomId)
          .then((roomData) => {
            if (roomData) {
              console.log('useEffect: Sala carregada com sucesso:', roomData);
              setSelectedRoom(roomData);
            } else {
              console.warn('useEffect: loadRoomData retornou null');
              setSelectedRoom(null);
            }
          })
          .catch((error) => {
            console.error('useEffect: Erro ao carregar sala:', error);
            setSelectedRoom(null);
          });
      } else {
        console.log('useEffect: Nenhum ID de sala encontrado');
        console.log('selectedEmployee.room:', selectedEmployee.room);
        setSelectedRoom(null);
      }
    } else if (isDialogOpen && !selectedEmployee) {
      // Se não há employee selecionado (criação), limpar selectedRoom
      setSelectedRoom(null);
    }
  }, [isDialogOpen, selectedEmployee, extractRoomId, loadRoomData]);

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
      const employeeId = employee._id || employee.id;
      if (!employeeId) {
        toast.error('Funcionário sem ID válido');
        return;
      }
      
      console.log('=== INÍCIO DO CARREGAMENTO DO FUNCIONÁRIO ===');
      console.log('Employee ID:', employeeId);
      
      const fullEmployee = await getEmployeeById(employeeId);
      console.log('Employee completo carregado:', fullEmployee);
      console.log('Tipo do campo room:', typeof fullEmployee.room);
      console.log('Campo room do employee:', fullEmployee.room);
      console.log('Campo room (JSON):', JSON.stringify(fullEmployee.room, null, 2));
      
      setSelectedEmployee(fullEmployee);
      setFormData({
        contract_number: fullEmployee.contract_number,
        name: fullEmployee.name,
        role: fullEmployee.role,
        salary: fullEmployee.salary,
        organizational_unit: fullEmployee.organizational_unit || '',
        room: fullEmployee.room,
      });
      
      // Extrair ID da sala usando a função auxiliar
      const roomId = extractRoomId(fullEmployee.room);
      console.log('ID da sala extraído:', roomId);
      
      if (roomId) {
        try {
          const roomData = await loadRoomData(roomId);
          if (roomData && roomData.id && roomData.building && roomData.number) {
            console.log('Sala carregada com sucesso, definindo no estado:', roomData);
            setSelectedRoom(roomData);
            // Atualizar formData.room para garantir consistência
            setFormData(prev => ({
              ...prev,
              room: { idRoom: roomData.id }
            }));
          } else {
            console.warn('Não foi possível carregar os dados da sala - dados incompletos');
            toast.warning('Não foi possível carregar os dados da sala associada');
            setSelectedRoom(null);
          }
        } catch (error) {
          console.error('Erro ao carregar dados da sala:', error);
          toast.warning('Não foi possível carregar os dados da sala associada');
          setSelectedRoom(null);
        }
      } else {
        console.log('Nenhum ID de sala encontrado no employee');
        console.log('Estrutura completa do employee:', JSON.stringify(fullEmployee, null, 2));
        setSelectedRoom(null);
      }
      
      console.log('=== FIM DO CARREGAMENTO DO FUNCIONÁRIO ===');
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
      const employeeId = selectedEmployee._id || selectedEmployee.id;
      if (!employeeId) {
        toast.error('Funcionário sem ID válido');
        return;
      }
      await deleteEmployee(employeeId);
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
        // NOTA: O EmployeeUpdateRequest no backend Java aceita APENAS:
        // - salary (BigDecimal)
        // - organizationalUnit (String)
        // - room (RoomReferenceDto)
        // NÃO aceita: contractNumber, name, role (esses campos não podem ser atualizados)
        const employeeId = selectedEmployee._id || selectedEmployee.id;
        if (!employeeId) {
          toast.error('Funcionário sem ID válido');
          return;
        }
        const updateData: EmployeeUpdateRequest = {
          salary: formData.salary,
          organizational_unit: formData.organizational_unit || undefined,
          room: formData.room,
        };
        await updateEmployee(employeeId, updateData);
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

  // Funções para gerenciamento de tasks
  const loadTasks = useCallback(async (employeeId: string) => {
    if (!employeeId) return;
    
    try {
      setLoadingTasks(true);
      const tasksList = await getEmployeeTasks(employeeId, {
        description: taskSearchTerm || undefined,
        startDate: taskStartDate || undefined,
        endDate: taskEndDate || undefined,
      });
      setTasks(tasksList || []);
    } catch (error) {
      console.error('Erro ao carregar tasks:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar tarefas'
      );
    } finally {
      setLoadingTasks(false);
    }
  }, [taskSearchTerm, taskStartDate, taskEndDate]);

  const handleOpenTasksDialog = async (employee: Employee) => {
    // Aceitar tanto _id quanto id (backend pode retornar qualquer um)
    const employeeId = employee._id || employee.id;
    if (!employeeId) {
      toast.error('Funcionário sem ID válido');
      console.error('Employee sem id ou _id:', employee);
      return;
    }
    setSelectedEmployee(employee);
    setSelectedEmployeeId(employeeId);
    console.log('Dialog de tasks aberto para employeeId:', employeeId);
    setIsTasksDialogOpen(true);
    setTaskSearchTerm('');
    setTaskStartDate('');
    setTaskEndDate('');
    await loadTasks(employeeId);
  };

  const handleCreateTask = () => {
    console.log('handleCreateTask chamado - selectedEmployeeId:', selectedEmployeeId, 'selectedEmployee:', selectedEmployee);
    // Garantir que temos o employeeId disponível (aceitar tanto _id quanto id)
    const employeeId = selectedEmployeeId || selectedEmployee?._id || selectedEmployee?.id;
    if (!employeeId) {
      toast.error('ID do funcionário não encontrado. Por favor, feche e reabra o dialog de tarefas.');
      console.error('selectedEmployeeId e selectedEmployee.id/_id estão null ao tentar criar task');
      return;
    }
    // Se selectedEmployeeId não estiver definido, definir agora
    if (!selectedEmployeeId && (selectedEmployee?._id || selectedEmployee?.id)) {
      const idToSet = selectedEmployee._id || selectedEmployee.id;
      console.log('Definindo selectedEmployeeId como:', idToSet);
      setSelectedEmployeeId(idToSet);
    }
    setSelectedTask(null);
    setTaskFormData({
      description: '',
      startDate: '',
      expectedEndDate: '',
      actualEndDate: undefined,
    });
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = async (task: Task) => {
    try {
      if (!selectedEmployeeId) return;
      setLoadingTasks(true);
      const fullTask = await getEmployeeTask(selectedEmployeeId, task.id || task._id || '');
      setSelectedTask(fullTask);
      setTaskFormData({
        description: fullTask.description,
        startDate: fullTask.startDate || fullTask.start_date || '',
        expectedEndDate: fullTask.expectedEndDate || fullTask.expected_end_date || '',
        actualEndDate: fullTask.actualEndDate || fullTask.actual_end_date || undefined,
      });
      setIsTaskDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar task:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar tarefa'
      );
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteTaskDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!selectedTask || !selectedEmployeeId) return;

    try {
      setIsSubmitting(true);
      await deleteEmployeeTask(selectedEmployeeId, selectedTask.id || selectedTask._id || '');
      toast.success('Tarefa excluída com sucesso');
      setIsDeleteTaskDialogOpen(false);
      setSelectedTask(null);
      await loadTasks(selectedEmployeeId);
    } catch (error) {
      console.error('Erro ao excluir task:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao excluir tarefa'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Garantir que temos o employeeId disponível (aceitar tanto _id quanto id)
    const employeeId = selectedEmployeeId || selectedEmployee?._id || selectedEmployee?.id;
    if (!employeeId) {
      console.error('selectedEmployeeId e selectedEmployee.id/_id estão null no handleTaskSubmit');
      toast.error('ID do funcionário não encontrado. Por favor, feche e reabra o dialog de tarefas.');
      return;
    }
    
    // Se selectedEmployeeId não estiver definido, definir agora
    if (!selectedEmployeeId && (selectedEmployee?._id || selectedEmployee?.id)) {
      const idToSet = selectedEmployee._id || selectedEmployee.id;
      setSelectedEmployeeId(idToSet);
    }
    
    const finalEmployeeId = selectedEmployeeId || selectedEmployee?._id || selectedEmployee?.id || '';
    console.log('Criando/atualizando task para employeeId:', finalEmployeeId);
    
    if (!taskFormData.description || !taskFormData.startDate || !taskFormData.expectedEndDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (selectedTask) {
        // Atualizar
        const updateData: TaskUpdateRequest = {
          description: taskFormData.description,
          startDate: taskFormData.startDate,
          expectedEndDate: taskFormData.expectedEndDate,
          actualEndDate: taskFormData.actualEndDate || undefined,
        };
        await updateEmployeeTask(finalEmployeeId, selectedTask.id || selectedTask._id || '', updateData);
        toast.success('Tarefa atualizada com sucesso');
      } else {
        // Criar
        const createData: TaskCreateRequest = {
          description: taskFormData.description,
          startDate: taskFormData.startDate,
          expectedEndDate: taskFormData.expectedEndDate,
          actualEndDate: taskFormData.actualEndDate || undefined,
        };
        await createEmployeeTask(finalEmployeeId, createData);
        toast.success('Tarefa criada com sucesso');
      }
      
      setIsTaskDialogOpen(false);
      setSelectedTask(null);
      await loadTasks(finalEmployeeId);
    } catch (error) {
      console.error('Erro ao salvar task:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar tarefa'
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
                      <TableRow key={employee._id || employee.id}>
                        <TableCell className="font-medium">
                          {employee.contract_number !== undefined && employee.contract_number !== null
                            ? employee.contract_number
                            : '-'}
                        </TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {employee.organizational_unit && employee.organizational_unit.trim() !== ''
                            ? employee.organizational_unit
                            : '-'}
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
                              onClick={() => handleOpenTasksDialog(employee)}
                              title="Gerenciar tarefas"
                            >
                              <CheckSquare className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(employee)}
                              title="Editar funcionário"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(employee)}
                              title="Excluir funcionário"
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
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          // Se estiver fechando o dialog e não houver employee selecionado (criação), limpar selectedRoom
          if (!open && !selectedEmployee) {
            setSelectedRoom(null);
          }
        }}
      >
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
                  {!selectedRoom && !formData.room && (
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                      Este funcionário não possui uma sala associada. Selecione uma sala abaixo e salve o funcionário para associar.
                    </div>
                  )}
                  {selectedRoom && (
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                      Sala atual: {selectedRoom.building} - {selectedRoom.number}
                    </div>
                  )}
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
                        className={selectedRoom ? '' : 'text-muted-foreground'}
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
                        className={selectedRoom ? '' : 'text-muted-foreground'}
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
                    {selectedRoom ? 'Alterar Sala' : 'Buscar Sala'}
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
                  // Não limpar selectedRoom ao cancelar se estiver editando
                  // Isso permite que os dados sejam mantidos caso o dialog seja reaberto
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

      {/* Dialog de Gerenciamento de Tasks */}
      <Dialog open={isTasksDialogOpen} onOpenChange={(open) => {
        setIsTasksDialogOpen(open);
        if (!open && !isTaskDialogOpen) {
          // Limpar estados apenas quando ambos os dialogs estão fechados
          setSelectedEmployeeId(null);
          setTasks([]);
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Tarefas de {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription>
              Gerencie as tarefas do funcionário
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task_search">Buscar por descrição</Label>
                <Input
                  id="task_search"
                  placeholder="Descrição..."
                  value={taskSearchTerm}
                  onChange={(e) => {
                    setTaskSearchTerm(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && selectedEmployeeId) {
                      loadTasks(selectedEmployeeId);
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task_start_date">Data início</Label>
                <Input
                  id="task_start_date"
                  type="date"
                  value={taskStartDate}
                  onChange={(e) => setTaskStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task_end_date">Data fim</Label>
                <Input
                  id="task_end_date"
                  type="date"
                  value={taskEndDate}
                  onChange={(e) => setTaskEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (selectedEmployeeId) {
                    loadTasks(selectedEmployeeId);
                  }
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTaskSearchTerm('');
                  setTaskStartDate('');
                  setTaskEndDate('');
                  if (selectedEmployeeId) {
                    loadTasks(selectedEmployeeId);
                  }
                }}
              >
                Limpar
              </Button>
            </div>

            {/* Tabela de Tasks */}
            {loadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma tarefa encontrada
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Data Fim Esperada</TableHead>
                      <TableHead>Data Fim Real</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id || task._id}>
                        <TableCell className="max-w-[300px] truncate">
                          {task.description}
                        </TableCell>
                        <TableCell>
                          {task.startDate || task.start_date
                            ? new Date(task.startDate || task.start_date || '').toLocaleDateString('pt-BR')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {task.expectedEndDate || task.expected_end_date
                            ? new Date(task.expectedEndDate || task.expected_end_date || '').toLocaleDateString('pt-BR')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {task.actualEndDate || task.actual_end_date ? (
                            <Badge variant="default" className="bg-green-500">
                              {new Date(task.actualEndDate || task.actual_end_date || '').toLocaleDateString('pt-BR')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Em andamento</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTask(task)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task)}
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
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTasksDialogOpen(false)}
            >
              Fechar
            </Button>
            <Button type="button" onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Criar/Editar Task */}
      <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
        setIsTaskDialogOpen(open);
        if (!open) {
          setSelectedTask(null);
          // Limpar selectedEmployeeId apenas se o dialog de tasks também estiver fechado
          if (!isTasksDialogOpen) {
            setSelectedEmployeeId(null);
          }
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
            <DialogDescription>
              {selectedTask
                ? 'Atualize as informações da tarefa'
                : 'Preencha os dados para criar uma nova tarefa'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task_description">
                  Descrição <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="task_description"
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task_start_date_form">
                  Data de Início <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="task_start_date_form"
                  type="date"
                  value={taskFormData.startDate}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task_expected_end_date">
                  Data de Fim Esperada <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="task_expected_end_date"
                  type="date"
                  value={taskFormData.expectedEndDate}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, expectedEndDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task_actual_end_date">Data de Fim Real</Label>
                <Input
                  id="task_actual_end_date"
                  type="date"
                  value={taskFormData.actualEndDate || ''}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      actualEndDate: e.target.value || undefined,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTaskDialogOpen(false);
                  setSelectedTask(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {selectedTask ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão de Task */}
      <AlertDialog open={isDeleteTaskDialogOpen} onOpenChange={setIsDeleteTaskDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
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
    </div>
  );
}

