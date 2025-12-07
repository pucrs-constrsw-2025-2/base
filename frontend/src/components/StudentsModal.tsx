import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Student, StudentCreateRequest, StudentUpdateRequest } from '../services/students.service';

interface StudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (data: StudentCreateRequest | StudentUpdateRequest) => Promise<void>;
  isLoading: boolean;
}

export function StudentsModal({ open, onOpenChange, student, onSave, isLoading }: StudentsModalProps) {
  const [formData, setFormData] = useState<StudentCreateRequest>({
    registration_number: '',
    name: '',
    email: '',
    phone_numbers: [],
    course: '',
    enrollment_status: 'active',
  });

  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        registration_number: student.registration_number || '',
        name: student.name || '',
        email: student.email || '',
        phone_numbers: student.phone_numbers || [],
        course: student.course || '',
        enrollment_status: student.enrollment_status || 'active',
      });
    } else {
      setFormData({
        registration_number: '',
        name: '',
        email: '',
        phone_numbers: [],
        course: '',
        enrollment_status: 'active',
      });
      setPhoneInput('');
    }
  }, [student, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleAddPhone = () => {
    if (phoneInput.trim()) {
      setFormData({
        ...formData,
        phone_numbers: [...(formData.phone_numbers || []), phoneInput.trim()],
      });
      setPhoneInput('');
    }
  };

  const handleRemovePhone = (index: number) => {
    setFormData({
      ...formData,
      phone_numbers: formData.phone_numbers?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Editar Estudante' : 'Novo Estudante'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="registration_number">Matrícula</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course">Curso</Label>
              <Input
                id="course"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="enrollment_status">Status</Label>
              <Select
                value={formData.enrollment_status}
                onValueChange={(value) => setFormData({ ...formData, enrollment_status: value })}
              >
                <SelectTrigger id="enrollment_status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="graduated">Formado</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Telefones</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar telefone"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPhone();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddPhone} variant="outline">
                  Adicionar
                </Button>
              </div>
              {formData.phone_numbers && formData.phone_numbers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.phone_numbers.map((phone, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-md text-sm"
                    >
                      <span>{phone}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhone(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
