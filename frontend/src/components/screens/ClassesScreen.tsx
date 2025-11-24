import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";
import { Pencil, Trash, PlusCircle, Calendar } from "lucide-react";
import * as classesApi from "../../services/classes";
import { Class as ClassType } from "../../types/class";

export function ClassesScreen() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters / pagination
  const [year, setYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  // dialog / form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassType | null>(null);
  const [form, setForm] = useState({
    name: "",
    year: "",
    semester: "",
    course_id: "",
    code: "",
    capacity: "",
  });

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, size };
      if (year) params.year = Number(year);
      if (semester) params.semester = Number(semester);
      if (courseId) params.course_id = courseId;

      const res = await classesApi.listClasses(params);
      setClasses(res.items || res.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro ao carregar turmas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      year: "",
      semester: "",
      course_id: "",
      code: "",
      capacity: "",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (c: ClassType) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      year: String(c.year || ""),
      semester: String(c.semester || ""),
      course_id: c.course_id || "",
      code: c.code || "",
      capacity: c.capacity ? String(c.capacity) : "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        year: Number(form.year),
        semester: Number(form.semester),
        course_id: form.course_id || undefined,
        code: form.code || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      };
      if (editing && editing.id) {
        await classesApi.updateClass(editing.id, payload);
      } else {
        await classesApi.createClass(payload);
      }
      setIsDialogOpen(false);
      fetchList();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Erro ao salvar turma");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const confirmed = confirm("Tem certeza que deseja excluir esta turma?");
    if (!confirmed) return;
    try {
      await classesApi.deleteClass(id);
      fetchList();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Erro ao excluir turma");
    }
  };

  const handleFilter = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    await fetchList();
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Cadastro de Turmas</CardTitle>
                <CardDescription>
                  Gerencie turmas: criar, editar, listar e excluir
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={openCreate} variant="default">
                <PlusCircle className="w-4 h-4 mr-2" /> Nova Turma
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form
              className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4"
              onSubmit={handleFilter}
            >
              <div className="md:col-span-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="semester">Semestre</Label>
                <Input
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="course">Course ID</Label>
                <Input
                  id="course"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  placeholder="course_id"
                />
              </div>
              <div className="md:col-span-6 flex space-x-2 mt-2">
                <Button type="submit">Filtrar</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setYear("");
                    setSemester("");
                    setCourseId("");
                    setPage(1);
                    fetchList();
                  }}
                >
                  Limpar
                </Button>
              </div>
            </form>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left">
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">Ano</th>
                      <th className="px-3 py-2">Semestre</th>
                      <th className="px-3 py-2">Course ID</th>
                      <th className="px-3 py-2">Capacidade</th>
                      <th className="px-3 py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhuma turma encontrada
                        </td>
                      </tr>
                    ) : (
                      classes.map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="px-3 py-2">{c.code || "-"}</td>
                          <td className="px-3 py-2">{c.name}</td>
                          <td className="px-3 py-2">{c.year}</td>
                          <td className="px-3 py-2">{c.semester}</td>
                          <td className="px-3 py-2">{c.course_id || "-"}</td>
                          <td className="px-3 py-2">{c.capacity ?? "-"}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => openEdit(c)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(c.id)}
                                className="text-destructive"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* pagination */}
            <div className="flex items-center justify-between mt-4">
              <div />
              <div className="flex items-center space-x-2">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span>Página {page}</span>
                <Button onClick={() => setPage((p) => p + 1)}>Próxima</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for create / edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {/* hidden trigger - we open dialog programmatically */}
          <button style={{ display: "none" }} aria-hidden />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="yearForm"
                  value={form.year}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, year: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="semesterForm">Semestre</Label>
                <Input
                  id="semesterForm"
                  value={form.semester}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, semester: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="course_id">Course ID</Label>
              <Input
                id="course_id"
                value={form.course_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, course_id: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacity: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Salvar</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
