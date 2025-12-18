import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Menu, 
  Home, 
  Users, 
  GraduationCap, 
  Building, 
  BookOpen, 
  Calendar, 
  Monitor, 
  ClipboardList, 
  Briefcase,
  LogOut 
} from 'lucide-react';

type UserRole = 'Administrador' | 'Coordenador' | 'Professor' | 'Aluno';

interface User {
  name: string;
  role: UserRole;
  avatar: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

export function MainLayout({ children, currentUser, onLogout, onNavigate }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'professors', label: 'Cadastro de Professores', icon: GraduationCap },
    { id: 'students', label: 'Cadastro de Estudantes', icon: Users },
    { id: 'employees', label: 'Cadastro de Funcionários', icon: Briefcase },
    { id: 'rooms', label: 'Cadastro de Salas', icon: Building },
    { id: 'subjects', label: 'Cadastro de Disciplinas', icon: BookOpen },
    { id: 'classes', label: 'Cadastro de Turmas', icon: Calendar },
    { id: 'lessons', label: 'Cadastro de Aulas', icon: Calendar },
    { id: 'resources', label: 'Cadastro de Recursos Computacionais', icon: Monitor },
    { id: 'reservations', label: 'Cadastro de Reservas de Recursos', icon: ClipboardList },
  ];

  const handleNavigation = (screenId: string) => {
    onNavigate(screenId);
    setIsMobileMenuOpen(false);
  };

  const SidebarMenuItems = () => (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton onClick={() => handleNavigation(item.id)}>
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="p-4 border-b">
            <h2 className="font-semibold text-primary">Closed CRAS</h2>
            <div className="flex items-center space-x-3 mt-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {currentUser.role}
                </Badge>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenuItems />
            <div className="mt-auto pt-4 border-t">
              <Button
                variant="ghost"
                onClick={onLogout}
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full min-w-0">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de Navegação</SheetTitle>
                  <SheetDescription>
                    Menu principal de navegação do sistema
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <h2 className="font-semibold text-primary mb-4">Closed CRAS</h2>
                  <div className="flex items-center space-x-3 mb-6">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{currentUser.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {currentUser.role}
                      </Badge>
                    </div>
                  </div>
                  <nav className="space-y-2">
                    {menuItems.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleNavigation(item.id)}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                  <div className="mt-8 pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={onLogout}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold">Closed CRAS</h1>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="text-xs">{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <h1 className="font-semibold">Sistema de Gestão de Recursos Computacionais</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-medium">{currentUser.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {currentUser.role}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" onClick={onLogout} className="text-destructive hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto w-full">
            <div className="w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}