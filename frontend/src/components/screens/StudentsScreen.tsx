import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
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
import { Users, Search, Trash2, Loader2, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  type Student,
  type StudentCreateRequest,
  type StudentUpdateRequest,
} from '../../services/students.service';
import { StudentsModal } from '../StudentsModal';

export function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStudents({ page, size, name: searchTerm || undefined });

      // API retorna { data: [], meta: {...} }
      setStudents(response.data || []);
      console.log(response.data)
      if (response.meta) {
        setTotal(response.meta.total || response.data?.length || 0);
      } else {
        setTotal(response.data?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar estudantes');
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;
    try {
      setIsSubmitting(true);
      await deleteStudent(selectedStudent.id);
      toast.success('Estudante excluído com sucesso');
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (error) {
      console.error('Erro ao excluir estudante:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir estudante');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveStudent = async (data: StudentCreateRequest | StudentUpdateRequest) => {
    try {
      setIsSubmitting(true);
      if (editingStudent) {
        await updateStudent(editingStudent.id, data as StudentUpdateRequest);
        toast.success('Estudante atualizado com sucesso');
      } else {
        await createStudent(data as StudentCreateRequest);
        toast.success('Estudante criado com sucesso');
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      loadStudents();
    } catch (error) {
      console.error('Erro ao salvar estudante:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar estudante');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="p-4 md:p-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Cadastro de Estudantes</CardTitle>
              </div>
              <CardDescription>Gerencie o cadastro de estudantes do sistema</CardDescription>
            </div>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Estudante
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <Search className="text-muted-foreground w-4 h-4" />
              </div>
              <Input
                placeholder="Buscar por nome, matrícula ou email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-[2.75rem] px-6"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{searchTerm ? 'Nenhum estudante encontrado' : 'Nenhum estudante cadastrado'}</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Currículo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.enrollment}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.courseCurriculum}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(student)}>
                              <Edit className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(student)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((page - 1) * size) + 1} a {Math.min(page * size, total)} de {total} estudantes
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este estudante?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Modal */}
      <StudentsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        student={editingStudent}
        onSave={handleSaveStudent}
        isLoading={isSubmitting}
      />
    </div>
  );
}