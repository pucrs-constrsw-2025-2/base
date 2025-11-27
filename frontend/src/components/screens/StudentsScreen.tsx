import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users } from 'lucide-react';

export function StudentsScreen() {
  return (
    <div className="p-4 md:p-6 w-full">
      <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Cadastro de Estudantes</CardTitle>
            <CardDescription>
              Esta tela será desenvolvida para gerenciar o cadastro de estudantes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Funcionalidade em desenvolvimento...
            </p>
          </CardContent>
        </Card>
    </div>
  );
}