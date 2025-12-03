/**
 * ProfessorsScreen
 *
 * Tela de gerenciamento de professores com funcionalidades de CRUD completo.
 *
 * Funcionalidades:
 * - Listar professores com busca e paginação
 * - Criar novo professor
 * - Editar professor existente
 * - Excluir professor (com confirmação)
 */

import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Componentes UI (shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Service de professores
import {
  Professor,
  ProfessorCreateRequest,
  ProfessorUpdateRequest,
  getProfessors,
  createProfessor,
  updateProfessor,
  deleteProfessor,
} from "../../services/professors.service";

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Badge de status do professor
 */
function StatusBadge({ status }: { status: Professor["status"] }) {
  const statusConfig = {
    active: {
      label: "Ativo",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    inactive: {
      label: "Inativo",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    on_leave: {
      label: "Afastado",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ProfessorsScreen() {
  // -------------------------------------------------------------------------
  // ESTADOS
  // -------------------------------------------------------------------------

  // Lista de professores
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca e paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog de criação/edição
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(
    null
  );
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Campos do formulário
  const [formData, setFormData] = useState({
    name: "",
    registration_number: "",
    institucional_email: "",
    status: "active" as Professor["status"],
  });

  // Dialog de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<Professor | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // -------------------------------------------------------------------------
  // FUNÇÕES DE CARREGAMENTO
  // -------------------------------------------------------------------------

  /**
   * Carrega a lista de professores da API
   */
  const loadProfessors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfessors();
      setProfessors(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar professores";
      setError(errorMessage);
      console.error("Erro ao carregar professores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega professores ao montar o componente
  useEffect(() => {
    loadProfessors();
  }, [loadProfessors]);

  // -------------------------------------------------------------------------
  // FILTRO E PAGINAÇÃO
  // -------------------------------------------------------------------------

  // Filtra professores pelo termo de busca
  const filteredProfessors = professors.filter((professor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      professor.name.toLowerCase().includes(searchLower) ||
      professor.institucional_email.toLowerCase().includes(searchLower) ||
      professor.registration_number.toString().includes(searchLower)
    );
  });

  // Calcula paginação
  const totalPages = Math.ceil(filteredProfessors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProfessors = filteredProfessors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // -------------------------------------------------------------------------
  // HANDLERS DO FORMULÁRIO
  // -------------------------------------------------------------------------

  /**
   * Reseta o formulário para valores iniciais
   */
  const resetForm = () => {
    setFormData({
      name: "",
      registration_number: "",
      institucional_email: "",
      status: "active",
    });
    setSelectedProfessor(null);
    setIsEditing(false);
    setFormError(null);
  };

  /**
   * Abre o dialog para criar novo professor
   */
  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  /**
   * Abre o dialog para editar um professor existente
   */
  const handleEdit = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsEditing(true);
    setFormError(null);
    setFormData({
      name: professor.name,
      registration_number: professor.registration_number.toString(),
      institucional_email: professor.institucional_email,
      status: professor.status,
    });
    setIsDialogOpen(true);
  };

  /**
   * Abre o dialog de confirmação de exclusão
   */
  const handleDeleteClick = (professor: Professor) => {
    setProfessorToDelete(professor);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Confirma e executa a exclusão do professor
   */
  const handleDeleteConfirm = async () => {
    if (!professorToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteProfessor(professorToDelete.id);
      await loadProfessors();
      setIsDeleteDialogOpen(false);
      setProfessorToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir professor:", err);
      alert(err instanceof Error ? err.message : "Erro ao excluir professor");
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Valida o formulário
   */
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormError("O nome é obrigatório");
      return false;
    }
    if (!formData.registration_number) {
      setFormError("O número de matrícula é obrigatório");
      return false;
    }
    if (parseInt(formData.registration_number) <= 0) {
      setFormError("O número de matrícula deve ser positivo");
      return false;
    }
    if (!formData.institucional_email.trim()) {
      setFormError("O email institucional é obrigatório");
      return false;
    }
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.institucional_email)) {
      setFormError("O email institucional não é válido");
      return false;
    }
    return true;
  };

  /**
   * Salva o professor (criação ou atualização)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validação
    if (!validateForm()) {
      return;
    }

    try {
      setFormLoading(true);

      if (isEditing && selectedProfessor) {
        // Atualização
        const updateData: ProfessorUpdateRequest = {
          name: formData.name,
          registration_number: parseInt(formData.registration_number),
          institucional_email: formData.institucional_email,
          status: formData.status,
        };
        await updateProfessor(selectedProfessor.id, updateData);
      } else {
        // Criação
        const createData: ProfessorCreateRequest = {
          name: formData.name,
          registration_number: parseInt(formData.registration_number),
          institucional_email: formData.institucional_email,
          status: formData.status,
        };
        await createProfessor(createData);
      }

      // Recarrega a lista e fecha o dialog
      await loadProfessors();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar professor:", err);
      setFormError(
        err instanceof Error ? err.message : "Erro ao salvar professor"
      );
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Fecha o dialog e reseta o formulário
   */
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  // -------------------------------------------------------------------------
  // RENDERIZAÇÃO - ESTADO DE CARREGAMENTO
  // -------------------------------------------------------------------------

  if (loading && professors.length === 0) {
    return (
      <div className="p-4 md:p-6 w-full">
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Carregando professores...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDERIZAÇÃO - ESTADO DE ERRO
  // -------------------------------------------------------------------------

  if (error && professors.length === 0) {
    return (
      <div className="p-4 md:p-6 w-full">
        <Card className="w-full">
          <CardContent className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadProfessors}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // -------------------------------------------------------------------------

  return (
    <div className="p-4 md:p-6 w-full">
      <Card className="w-full">
        {/* Header */}
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Cadastro de Professores</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={loadProfessors}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Professor
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Barra de Busca */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou matrícula..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset para primeira página ao buscar
                }}
                className="pl-10"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredProfessors.length} professor(es) encontrado(s)
            </span>
          </div>

          {/* Tabela de Professores */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Email Institucional
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProfessors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm
                        ? "Nenhum professor encontrado para a busca."
                        : 'Nenhum professor cadastrado. Clique em "Novo Professor" para adicionar.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProfessors.map((professor) => (
                    <TableRow key={professor.id}>
                      <TableCell className="font-medium">
                        {professor.name}
                      </TableCell>
                      <TableCell>{professor.registration_number}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {professor.institucional_email}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={professor.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(professor)}
                            title="Editar professor"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(professor)}
                            title="Excluir professor"
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} (
                {filteredProfessors.length} itens)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm min-w-[80px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  title="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Professor" : "Novo Professor"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize as informações do professor abaixo."
                : "Preencha os dados para cadastrar um novo professor."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Mensagem de Erro */}
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-md text-sm">
                  {formError}
                </div>
              )}

              {/* Campo: Nome */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Dr. João da Silva"
                  disabled={formLoading}
                />
              </div>

              {/* Campo: Matrícula */}
              <div className="grid gap-2">
                <Label htmlFor="registration_number">
                  Número de Matrícula *
                </Label>
                <Input
                  id="registration_number"
                  type="number"
                  min="1"
                  value={formData.registration_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_number: e.target.value,
                    })
                  }
                  placeholder="Ex: 12345"
                  disabled={formLoading}
                />
              </div>

              {/* Campo: Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email Institucional *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.institucional_email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institucional_email: e.target.value,
                    })
                  }
                  placeholder="Ex: joao.silva@universidade.edu.br"
                  disabled={formLoading}
                />
              </div>

              {/* Campo: Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Professor["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={formLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="on_leave">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEditing ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o professor{" "}
              <strong>{professorToDelete?.name}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="!bg-red-600 !text-white hover:!bg-red-700 focus:ring-red-500"
            >
              {deleteLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
