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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import * as coursesService from "../../services/courses.service";
import * as classesApi from "../../services/classes";
import { Class as ClassType } from "../../types/class";

export function ClassesScreen() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [courses, setCourses] = useState<{ id: string; name?: string }[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters / pagination
  const [year, setYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const canGoNext = classes.length >= size;

  // dialog / form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassType | null>(null);
  const [form, setForm] = useState({
    classNumber: "",
    year: "",
    semester: "",
    schedule: "",
    course: "", // armazenamos o id do curso selecionado
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

  // Carregar lista de cursos para dropdown (executa uma vez)
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const data = await coursesService.listCourses();
        // Sanitiza para id & name (evita objetos grandes)
        setCourses((Array.isArray(data) ? data : []).map(c => ({ id: c.id, name: (c as any).name })));
      } catch (err: any) {
        console.error('Erro ao carregar cursos', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      classNumber: "",
      year: "",
      semester: "",
      schedule: "",
      course: "",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (c: ClassType) => {
    setEditing(c);
    setForm({
      classNumber: (c as any).classNumber ? String((c as any).classNumber) : "",
      year: String(c.year || ""),
      semester: String(c.semester || ""),
      schedule: (c as any).schedule || "",
      course: (c as any).course?.id || (c as any).course || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        classNumber: form.classNumber ? form.classNumber : null,
        year: Number(form.year),
        semester: Number(form.semester),
        schedule: form.schedule || null,
        exams: [],
        students: [],
        professors: [],
        course: form.course || null, // envia id do curso
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
    <div className="p-4 md:p-6 w-full">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle>Cadastro de Turmas</CardTitle>
            <CardDescription>
              Gerencie turmas: criar, editar, listar e excluir
            </CardDescription>
          </div>
          <div className="flex items-center justify-center mt-4">
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
              <Label htmlFor="yearFilter">Ano</Label>
              <Input
                id="yearFilter"
                value={year}
                onChange={(e: any) => setYear(e.target.value)}
                placeholder="2025"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="semesterFilter">Semestre</Label>
              <Input
                id="semesterFilter"
                value={semester}
                onChange={(e: any) => setSemester(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Course ID</Label>
              <Select value={courseId} onValueChange={(val: string) => setCourseId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCourses ? "Carregando..." : "Selecione"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.id}{c.name ? ` - ${c.name}` : ""}
                    </SelectItem>
                  ))}
                  {courses.length === 0 && !loadingCourses && (
                    <SelectItem disabled value="__empty">Nenhum curso</SelectItem>
                  )}
                </SelectContent>
              </Select>
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
                    <th className="px-3 py-2">Class Number</th>
                    <th className="px-3 py-2">Ano</th>
                    <th className="px-3 py-2">Semestre</th>
                    <th className="px-3 py-2">Schedule</th>
                    <th className="px-3 py-2">Course</th>
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
                        <td className="px-3 py-2">{(c as any).classNumber ?? "-"}</td>
                        <td className="px-3 py-2">{c.year}</td>
                        <td className="px-3 py-2">{c.semester}</td>
                        <td className="px-3 py-2">{(c as any).schedule ?? "-"}</td>
                        <td className="px-3 py-2">{(c as any).course?.id || (c as any).course || "-"}</td>
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
              <Button disabled={!canGoNext} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button style={{ display: "none" }} aria-hidden />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="classNumber">Class Number</Label>
              <Input
                id="classNumber"
                value={form.classNumber}
                onChange={(e: any) =>
                  setForm((f) => ({ ...f, classNumber: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="yearForm">Ano</Label>
                <Input
                  id="yearForm"
                  value={form.year}
                  onChange={(e: any) =>
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
                  onChange={(e: any) =>
                    setForm((f) => ({ ...f, semester: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={form.schedule}
                onChange={(e: any) =>
                  setForm((f) => ({ ...f, schedule: e.target.value }))
                }
                placeholder="Ex.: Seg/Qua 10:00-11:30"
              />
            </div>
            <div>
              <Label>Course</Label>
              <Select
                value={form.course}
                onValueChange={(val: string) => setForm((f: any) => ({ ...f, course: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCourses ? "Carregando..." : "Selecione"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.id}{c.name ? ` - ${c.name}` : ""}
                    </SelectItem>
                  ))}
                  {courses.length === 0 && !loadingCourses && (
                    <SelectItem disabled value="__empty">Nenhum curso</SelectItem>
                  )}
                </SelectContent>
              </Select>
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
