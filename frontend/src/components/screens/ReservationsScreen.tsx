import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ClipboardList } from 'lucide-react';

export function ReservationsScreen() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Cadastro de Reservas de Recursos Computacionais</CardTitle>
            <CardDescription>
              Esta tela será desenvolvida para gerenciar o cadastro de reservas de recursos computacionais
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Funcionalidade em desenvolvimento...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}