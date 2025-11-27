import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  GraduationCap, 
  Building, 
  Monitor, 
  Calendar,
  BookOpen,
  ClipboardList,
  TrendingUp
} from 'lucide-react';

export function Home() {
  const stats = [
    { label: 'Professores Cadastrados', value: '148', icon: GraduationCap, color: 'bg-blue-500' },
    { label: 'Estudantes Ativos', value: '2,847', icon: Users, color: 'bg-green-500' },
    { label: 'Salas Disponíveis', value: '32', icon: Building, color: 'bg-purple-500' },
    { label: 'Recursos Computacionais', value: '89', icon: Monitor, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { action: 'Nova reserva de laboratório', user: 'Prof. Silva', time: '10 min atrás' },
    { action: 'Cadastro de novo estudante', user: 'Admin', time: '25 min atrás' },
    { action: 'Atualização de sala', user: 'Prof. Santos', time: '1h atrás' },
    { action: 'Nova disciplina criada', user: 'Coordenação', time: '2h atrás' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de gestão de recursos computacionais da universidade
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% desde o mês passado
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse as funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Nova Reserva</h3>
                    <p className="text-sm text-muted-foreground">Reservar recursos computacionais</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Cadastrar Estudante</h3>
                    <p className="text-sm text-muted-foreground">Adicionar novo estudante</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Agendar Aula</h3>
                    <p className="text-sm text-muted-foreground">Criar nova aula/turma</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Gerenciar Recursos</h3>
                    <p className="text-sm text-muted-foreground">Visualizar recursos disponíveis</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{activity.user}</Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Monitoramento dos principais indicadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Monitor className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium">Recursos Online</h3>
              <p className="text-2xl font-bold text-green-600">87/89</p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                98% Disponível
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Reservas Hoje</h3>
              <p className="text-2xl font-bold text-blue-600">24</p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                75% Ocupação
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium">Aulas Ativas</h3>
              <p className="text-2xl font-bold text-purple-600">12</p>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Em Andamento
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}