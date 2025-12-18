import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Plus, Search, Loader2, ClipboardList, Building2, Book } from 'lucide-react';
import { toast } from 'sonner';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  type Reservation,
  type CreateReservationRequest,
} from '../../services/reservations.service';
import { getResources, getResourceById, type Resource } from '../../services/resources.service';
import { getLessons, getLessonById, type Lesson } from '../../services/lessons.service';

export function ReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<CreateReservationRequest>({
    initial_date: '',
    end_date: '',
    details: '',
    resource_id: undefined,
    lesson_id: undefined,
  });

  // Resources selection state
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Lessons selection state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getReservations(searchTerm ? { reservation_id: searchTerm } : undefined);
      setReservations(list || []);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { loadReservations(); }, [loadReservations]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCreate = () => {
    setSelectedReservation(null);
    setSelectedResource(null);
    setSelectedLesson(null);
    setFormData({ initial_date: '', end_date: '', details: '', resource_id: undefined, lesson_id: undefined });
    setIsDialogOpen(true);
  };

  const handleEdit = async (r: Reservation) => {
    if (!r.id) {
      toast.error('ID da reserva ausente');
      return;
    }
    try {
      setLoading(true);
      const full = await getReservationById(r.id);
      setSelectedReservation(full);
      setFormData({
        initial_date: full.initial_date,
        end_date: full.end_date,
        details: full.details || '',
        resource_id: (full as any).resource_id || undefined,
        lesson_id: (full as any).lesson_id || undefined,
      });

      // load related resource and lesson for display if present
      if ((full as any).resource_id) {
        try {
          const res = await getResourceById((full as any).resource_id);
          setSelectedResource(res);
        } catch (err) {
          setSelectedResource(null);
        }
      } else {
        setSelectedResource(null);
      }

      if ((full as any).lesson_id) {
        try {
          const le = await getLessonById((full as any).lesson_id);
          setSelectedLesson(le);
        } catch (err) {
          setSelectedLesson(null);
        }
      } else {
        setSelectedLesson(null);
      }
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar reserva:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResourceDialog = async () => {
    setIsResourceDialogOpen(true);
    setLoadingResources(true);
    try {
      const response = await getResources({ limit: 100 });
      const items = (response as any).items || (Array.isArray(response) ? response : []);
      setResources(items);
    } catch (error) {
      console.error('Erro ao carregar recursos:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar recursos');
    } finally {
      setLoadingResources(false);
    }
  };

  const handleSelectResource = (res: Resource) => {
    setSelectedResource(res);
    setFormData({ ...formData, resource_id: res.id });
    setIsResourceDialogOpen(false);
    toast.success(`Recurso ${res.name || res.id} selecionado`);
  };

  const handleOpenLessonDialog = async () => {
    setIsLessonDialogOpen(true);
    setLoadingLessons(true);
    try {
      const response = await getLessons({ limit: 100 });
      const items = (response as any).items || (Array.isArray(response) ? response : []);
      setLessons(items);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar aulas');
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleSelectLesson = (le: Lesson) => {
    setSelectedLesson(le);
    setFormData({ ...formData, lesson_id: le.id });
    setIsLessonDialogOpen(false);
    toast.success(`Aula ${le.name || le.code || le.id} selecionada`);
  };

  const handleDelete = async (r: Reservation) => {
    if (!r.id) {
      toast.error('ID da reserva ausente');
      return;
    }
    if (!confirm(`Deseja excluir a reserva ${r.id}?`)) return;
    try {
      await deleteReservation(r.id);
      toast.success('Reserva excluída com sucesso');
      loadReservations();
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir reserva');
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.initial_date || !formData.end_date) {
      toast.error('Preencha as datas inicial e final');
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedReservation) {
        const id = selectedReservation.id;
        if (!id) throw new Error('ID da reserva ausente');
        await updateReservation(id, formData);
        toast.success('Reserva atualizada com sucesso');
        // clear selected after update
        setSelectedReservation(null);
        setSelectedResource(null);
        setSelectedLesson(null);
      } else {
        await createReservation(formData);
        toast.success('Reserva criada com sucesso');
      }
      setIsDialogOpen(false);
      loadReservations();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Cadastro de Reservas de Recursos Computacionais</CardTitle>
              </div>
              <CardDescription>Gerencie o cadastro de reservas de recursos computacionais</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Reserva
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <Search className="text-muted-foreground w-4 h-4" />
              </div>
              <Input placeholder="Buscar por reservation id..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-[2.75rem] px-6" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{searchTerm ? 'Nenhuma reserva encontrada com os critérios de busca' : 'Nenhuma reserva cadastrada'}</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data Inicial</TableHead>
                    <TableHead>Data Final</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((r) => (
                    <TableRow key={r.id || Math.random()}>
                      <TableCell className="font-medium">{r.id || '-'}</TableCell>
                      <TableCell>{r.initial_date}</TableCell>
                      <TableCell>{r.end_date}</TableCell>
                      <TableCell>{r.details || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>Editar</Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(r)}>Excluir</Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedReservation ? 'Editar Reserva' : 'Nova Reserva'}</DialogTitle>
            <DialogDescription>{selectedReservation ? 'Atualize os dados da reserva' : 'Preencha as informações para criar uma reserva'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="initial_date">Data Inicial <span className="text-destructive">*</span></Label>
                <Input id="initial_date" type="date" value={formData.initial_date} onChange={(e) => setFormData({ ...formData, initial_date: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">Data Final <span className="text-destructive">*</span></Label>
                <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="details">Detalhes</Label>
                <Input id="details" value={formData.details || ''} onChange={(e) => setFormData({ ...formData, details: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Recurso (opcional)</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label className="text-sm text-muted-foreground">Nome</Label>
                      <Input value={selectedResource?.name || ''} disabled placeholder="Nenhum recurso selecionado" />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-sm text-muted-foreground">Categoria</Label>
                      <Input value={selectedResource?.category || ''} disabled placeholder="Nenhum recurso selecionado" />
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={handleOpenResourceDialog} className="w-full">
                    <Building2 className="w-4 h-4 mr-2" /> Buscar Recurso
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Aula (opcional)</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label className="text-sm text-muted-foreground">Nome</Label>
                      <Input value={selectedLesson?.name || ''} disabled placeholder="Nenhuma aula selecionada" />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-sm text-muted-foreground">Código</Label>
                      <Input value={selectedLesson?.code || ''} disabled placeholder="Nenhuma aula selecionada" />
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={handleOpenLessonDialog} className="w-full">
                    <Book className="w-4 h-4 mr-2" /> Buscar Aula
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : selectedReservation ? 'Atualizar' : 'Criar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Seleção de Recursos */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Recurso</DialogTitle>
            <DialogDescription>Selecione um recurso da lista abaixo</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {loadingResources ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum recurso encontrado</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((res) => (
                      <TableRow key={res.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectResource(res)}>
                        <TableCell className="font-medium">{res.name || res.id}</TableCell>
                        <TableCell>{res.category || '-'}</TableCell>
                        <TableCell>{res.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsResourceDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Seleção de Aulas */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Aula</DialogTitle>
            <DialogDescription>Selecione uma aula da lista abaixo</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {loadingLessons ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma aula encontrada</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((le) => (
                      <TableRow key={le.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectLesson(le)}>
                        <TableCell className="font-medium">{le.name || le.id}</TableCell>
                        <TableCell>{(le as any).code || '-'}</TableCell>
                        <TableCell>{le.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsLessonDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}