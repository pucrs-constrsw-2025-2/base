import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Building,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  type Room,
  type RoomCreateRequest,
  type RoomUpdateRequest,
} from "../../services/rooms.service";

const ROOM_STATUS = [
  { value: "AVAILABLE", label: "Disponível" },
  { value: "OCCUPIED", label: "Ocupada" },
  { value: "MAINTENANCE", label: "Manutenção" },
] as const;

export function RoomsScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    building: "",
    category: "",
    status: "",
    number: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<RoomCreateRequest>({
    number: "",
    building: "",
    category: "",
    capacity: 0,
    floor: 0,
    description: "",
    status: "AVAILABLE",
  });

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRooms({
        page,
        limit,
        building: filters.building || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        number: searchTerm || filters.number || undefined,
      });
      setRooms(response.items || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 0);
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar salas"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, filters]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCreate = () => {
    setSelectedRoom(null);
    setFormData({
      number: "",
      building: "",
      category: "",
      capacity: 0,
      floor: 0,
      description: "",
      status: "AVAILABLE",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = async (room: Room) => {
    try {
      setLoading(true);
      const fullRoom = await getRoomById(room.id);
      setSelectedRoom(fullRoom);
      setFormData({
        number: fullRoom.number,
        building: fullRoom.building,
        category: fullRoom.category,
        capacity: fullRoom.capacity,
        floor: fullRoom.floor,
        description: fullRoom.description || "",
        status: fullRoom.status || "AVAILABLE",
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Erro ao carregar sala:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar sala"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRoom) return;

    try {
      setIsSubmitting(true);
      await deleteRoom(selectedRoom.id);
      toast.success("Sala excluída com sucesso");
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
      loadRooms();
    } catch (error) {
      console.error("Erro ao excluir sala:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir sala"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.number ||
      !formData.building ||
      !formData.category ||
      !formData.capacity ||
      !formData.floor
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.capacity <= 0) {
      toast.error("A capacidade deve ser maior que zero");
      return;
    }

    if (formData.floor < 0) {
      toast.error("O andar deve ser um número válido");
      return;
    }

    try {
      setIsSubmitting(true);

      if (selectedRoom) {
        // Atualizar
        const updateData: RoomUpdateRequest = {
          number: formData.number,
          building: formData.building,
          category: formData.category,
          capacity: formData.capacity,
          floor: formData.floor,
          description: formData.description || undefined,
          status: formData.status || "AVAILABLE",
        };
        await updateRoom(selectedRoom.id, updateData);
        toast.success("Sala atualizada com sucesso");
      } else {
        // Criar
        const createData: RoomCreateRequest = {
          number: formData.number,
          building: formData.building,
          category: formData.category,
          capacity: formData.capacity,
          floor: formData.floor,
          description: formData.description || undefined,
          status: formData.status || "AVAILABLE",
        };
        await createRoom(createData);
        toast.success("Sala criada com sucesso");
      }

      setIsDialogOpen(false);
      setSelectedRoom(null);
      loadRooms();
    } catch (error) {
      console.error("Erro ao salvar sala:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar sala"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      building: "",
      category: "",
      status: "",
      number: "",
    });
    setSearchTerm("");
    setPage(1);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "default";
      case "OCCUPIED":
        return "destructive";
      case "MAINTENANCE":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusOption = ROOM_STATUS.find((s) => s.value === status);
    return statusOption?.label || status;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Cadastro de Salas</CardTitle>
              </div>
              <CardDescription>
                Gerencie o cadastro de salas do sistema
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Sala
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Busca e Filtros */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <Search className="text-muted-foreground w-4 h-4" />
              </div>
              <Input
                placeholder="Buscar por número da sala..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-[2.75rem] px-6"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              {(filters.building ||
                filters.category ||
                filters.status ||
                filters.number) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid gap-2">
                  <Label htmlFor="filter-building">Prédio</Label>
                  <Input
                    id="filter-building"
                    placeholder="Ex: BLD1"
                    value={filters.building}
                    onChange={(e) => {
                      setFilters({ ...filters, building: e.target.value });
                      setPage(1);
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filter-category">Categoria</Label>
                  <Input
                    id="filter-category"
                    placeholder="Ex: LAB"
                    value={filters.category}
                    onChange={(e) => {
                      setFilters({ ...filters, category: e.target.value });
                      setPage(1);
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filter-status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => {
                      setFilters({ ...filters, status: value });
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="filter-status">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {ROOM_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filter-number">Número</Label>
                  <Input
                    id="filter-number"
                    placeholder="Ex: 101"
                    value={filters.number}
                    onChange={(e) => {
                      setFilters({ ...filters, number: e.target.value });
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ||
                filters.building ||
                filters.category ||
                filters.status ||
                filters.number
                  ? "Nenhuma sala encontrada com os critérios de busca"
                  : "Nenhuma sala cadastrada"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Prédio</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Andar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">
                          {room.number}
                        </TableCell>
                        <TableCell>{room.building}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{room.category}</Badge>
                        </TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.floor}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(room.status)}>
                            {getStatusLabel(room.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(room)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(room)}
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
                    Mostrando {(page - 1) * limit + 1} a{" "}
                    {Math.min(page * limit, total)} de {total} salas
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRoom ? "Editar Sala" : "Nova Sala"}
            </DialogTitle>
            <DialogDescription>
              {selectedRoom
                ? "Atualize as informações da sala"
                : "Preencha os dados para criar uma nova sala"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="number">
                    Número da Sala <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    placeholder="Ex: 101A"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="building">
                    Prédio <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) =>
                      setFormData({ ...formData, building: e.target.value })
                    }
                    placeholder="Ex: BLD1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">
                    Categoria <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Ex: LAB, CLASSROOM"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="floor">
                    Andar <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="floor"
                    type="number"
                    value={formData.floor || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        floor: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">
                    Capacidade <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status || "AVAILABLE"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Informações adicionais sobre a sala..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedRoom(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {selectedRoom ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a sala{" "}
              <strong>
                {selectedRoom?.building} - {selectedRoom?.number}
              </strong>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
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
    </div>
  );
}
