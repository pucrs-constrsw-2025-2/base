import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Building } from 'lucide-react';

export function BuildingsScreen() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Cadastro de Prédios e Salas</CardTitle>
            <CardDescription>
              Esta tela será desenvolvida para gerenciar o cadastro de prédios e salas
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