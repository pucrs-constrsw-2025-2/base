import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Student, StudentCreateRequest, StudentUpdateRequest } from '../services/students.service';
import { Loader2 } from 'lucide-react';

interface StudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSave: (data: StudentCreateRequest | StudentUpdateRequest) => Promise<void>;
  isLoading?: boolean;
}

export function StudentsModal({
  open,
  onOpenChange,
  student,
  onSave,
  isLoading = false,
}: StudentsModalProps) {
  const isEditing = !!student;
  const { control, handleSubmit, reset, formState: { errors } } = useForm<StudentCreateRequest>({
    defaultValues: {
      name: '',
      enrollment: '',
      email: '',
      course_curriculum: '',
    },
  });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        enrollment: student.enrollment,
        email: student.email,
        course_curriculum: student.course_curriculum,
      });
    } else {
      reset({
        name: '',
        enrollment: '',
        email: '',
        course_curriculum: '',
      });
    }
  }, [student, reset, open]);

  const onSubmit = async (data: StudentCreateRequest) => {
    try {
      await onSave(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar estudante:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Estudante' : 'Novo Estudante'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Nome é obrigatório' }}
              render={({ field }) => (
                <Input
                  id="name"
                  placeholder="Nome do estudante"
                  {...field}
                  disabled={isLoading}
                />
              )}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enrollment">Matrícula</Label>
            <Controller
              name="enrollment"
              control={control}
              rules={{ required: 'Matrícula é obrigatória' }}
              render={({ field }) => (
                <Input
                  id="enrollment"
                  placeholder="Número de matrícula"
                  {...field}
                  disabled={isLoading}
                />
              )}
            />
            {errors.enrollment && <p className="text-sm text-red-500">{errors.enrollment.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              }}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                  disabled={isLoading}
                />
              )}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_curriculum">Currículo do Curso</Label>
            <Controller
              name="course_curriculum"
              control={control}
              rules={{ required: 'Currículo é obrigatório' }}
              render={({ field }) => (
                <Input
                  id="course_curriculum"
                  placeholder="Ex: Engenharia de Software 2025"
                  {...field}
                  disabled={isLoading}
                />
              )}
            />
            {errors.course_curriculum && (
              <p className="text-sm text-red-500">{errors.course_curriculum.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                isEditing ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
