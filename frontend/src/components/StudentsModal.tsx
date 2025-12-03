import { useEffect, useState } from 'react';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Student, StudentCreateRequest, StudentUpdateRequest, PhoneNumber } from '../services/students.service';
import { Loader2, X } from 'lucide-react';

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
  const [classUuids, setClassUuids] = useState<string[]>([]);
  const [classInput, setClassInput] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [phoneDdd, setPhoneDdd] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneDescription, setPhoneDescription] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<StudentCreateRequest>({
    defaultValues: {
      name: '',
      enrollment: '',
      email: '',
      courseCurriculum: '',
      classes: [],
    },
  });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        enrollment: student.enrollment,
        email: student.email,
        courseCurriculum: student.courseCurriculum,
        classes: student.classes || [],
      });
      setClassUuids(student.classes || []);
      setPhoneNumbers(student.phoneNumbers || []);
    } else {
      reset({
        name: '',
        enrollment: '',
        email: '',
        courseCurriculum: '',
        classes: [],
      });
      setClassUuids([]);
      setClassInput('');
      setPhoneNumbers([]);
      setPhoneDdd('');
      setPhoneNumber('');
      setPhoneDescription('');
    }
  }, [student, reset, open]);

  const onSubmit = async (data: StudentCreateRequest) => {
    try {
      const dataWithClasses = {
        ...data,
        classes: classUuids,
        phoneNumbers: phoneNumbers,
      };
      await onSave(dataWithClasses);
      reset();
      setClassUuids([]);
      setClassInput('');
      setPhoneNumbers([]);
      setPhoneDdd('');
      setPhoneNumber('');
      setPhoneDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar estudante:', error);
    }
  };

  const addPhoneNumber = () => {
    if (phoneDdd.trim() && phoneNumber.trim()) {
      const newPhone: PhoneNumber = {
        ddd: parseInt(phoneDdd),
        number: parseInt(phoneNumber),
        description: phoneDescription.trim() || undefined,
      };
      setPhoneNumbers([...phoneNumbers, newPhone]);
      setPhoneDdd('');
      setPhoneNumber('');
      setPhoneDescription('');
    }
  };

  const removePhoneNumber = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_: PhoneNumber, i: number) => i !== index));
  };

  const addClassUuid = () => {
    const uuid = classInput.trim();
    if (uuid && !classUuids.includes(uuid)) {
      setClassUuids([...classUuids, uuid]);
      setClassInput('');
    }
  };

  const removeClassUuid = (uuid: string) => {
    setClassUuids(classUuids.filter((id: string) => id !== uuid));
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
            <Label htmlFor="courseCurriculum">Currículo do Curso</Label>
            <Controller
              name="courseCurriculum"
              control={control}
              rules={{ required: 'Currículo é obrigatório' }}
              render={({ field }) => (
                <Input
                  id="courseCurriculum"
                  placeholder="Ex: Engenharia de Software 2025"
                  {...field}
                  disabled={isLoading}
                />
              )}
            />
            {errors.courseCurriculum && (
              <p className="text-sm text-red-500">{errors.courseCurriculum.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="classes">Turmas (UUIDs)</Label>
            <div className="flex gap-2">
              <Input
                id="classes"
                placeholder="Cole o UUID da turma"
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addClassUuid();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addClassUuid}
                disabled={isLoading || !classInput.trim()}
              >
                Adicionar
              </Button>
            </div>
            
            {classUuids.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {classUuids.map(uuid => (
                  <div
                    key={uuid}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span className="truncate max-w-xs" title={uuid}>
                      {uuid.substring(0, 8)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => removeClassUuid(uuid)}
                      disabled={isLoading}
                      className="hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Telefones</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="DDD"
                  value={phoneDdd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneDdd(e.target.value)}
                  disabled={isLoading}
                  maxLength={2}
                />
                <Input
                  placeholder="Número"
                  value={phoneNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  maxLength={8}
                />
                <Input
                  placeholder="Descrição (opcional)"
                  value={phoneDescription}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addPhoneNumber}
                disabled={isLoading || !phoneDdd.trim() || !phoneNumber.trim()}
                className="w-full"
              >
                Adicionar Telefone
              </Button>
            </div>

            {phoneNumbers.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-slate-50">
                {phoneNumbers.map((phone: PhoneNumber, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <div className="text-sm">
                      <span className="font-medium">({phone.ddd}) {String(phone.number).replace(/(\d{4})(\d{4})/, '$1-$2')}</span>
                      {phone.description && <span className="text-gray-500 ml-2">- {phone.description}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoneNumber(index)}
                      disabled={isLoading}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
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
