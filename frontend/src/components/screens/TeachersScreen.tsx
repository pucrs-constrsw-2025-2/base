import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap, AlertTriangle, Loader } from 'lucide-react';

// Tipagem para os dados do professor
interface Teacher {
  id: number;
  name: string;
  email: string;
}

// Função que busca os dados da API
const fetchTeachers = async (): Promise<Teacher[]> => {
  // A URL usa o proxy configurado no vite.config.ts
  // A requisição para /api/teachers será redirecionada para http://localhost:3000/teachers
  const { data } = await axios.get('/api/teachers');
  return data;
};

export function TeachersScreen() {
  const { data: teachers, isLoading, isError, error } = useQuery<Teacher[], Error>({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  });

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Cadastro de Professores</CardTitle>
            <CardDescription>
              Esta tela gerencia o cadastro de professores.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Carregando professores...</p>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-12 bg-destructive/10 rounded-md">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <p className="mt-4 font-semibold text-destructive">Ocorreu um erro!</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            )}

            {teachers && (
              <ul className="space-y-2">
                {teachers.map((teacher) => (
                  <li key={teacher.id} className="p-2 border rounded-md">
                    {teacher.name} - {teacher.email}
                  </li>
                ))}
              </ul>
            )}

            {/* Exemplo de estado vazio */}
            {teachers && teachers.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground py-12">
                    Nenhum professor encontrado.
                </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
