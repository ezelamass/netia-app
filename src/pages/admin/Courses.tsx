import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  GraduationCap, Plus, Pencil, Trash2, BookOpen, Video, FileText,
  ChevronDown, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdminCourses } from '@/hooks/useAdminCourses';

const AdminCourses = () => {
  const {
    modules, isLoading,
    createModule, updateModule, deleteModule,
    createSection, deleteSection,
    createLesson, updateLesson, deleteLesson,
    upsertQuiz, deleteQuiz,
  } = useAdminCourses();

  const [filter, setFilter] = useState<string>('all');

  // Module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', coverUrl: '', targetRole: 'player' });

  // Lesson dialog
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonSectionId, setLessonSectionId] = useState('');
  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '', contentMd: '', durationMin: 0 });

  // Quiz state
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizPassPercent, setQuizPassPercent] = useState(70);

  const filteredModules = filter === 'all' ? modules : modules.filter(m => m.targetRole === filter);

  const openNewModule = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '', coverUrl: '', targetRole: 'player' });
    setModuleDialogOpen(true);
  };

  const openEditModule = (m: any) => {
    setEditingModule(m);
    setModuleForm({ title: m.title, description: m.description || '', coverUrl: m.coverUrl || '', targetRole: m.targetRole });
    setModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!moduleForm.title.trim()) return;
    if (editingModule) {
      await updateModule(editingModule.id, moduleForm);
    } else {
      await createModule(moduleForm);
    }
    setModuleDialogOpen(false);
  };

  const openNewLesson = (sectionId: string) => {
    setEditingLesson(null);
    setLessonSectionId(sectionId);
    setLessonForm({ title: '', videoUrl: '', contentMd: '', durationMin: 0 });
    setLessonDialogOpen(true);
  };

  const openEditLesson = (lesson: any, sectionId: string) => {
    setEditingLesson(lesson);
    setLessonSectionId(sectionId);
    setLessonForm({
      title: lesson.title,
      videoUrl: lesson.videoUrl || '',
      contentMd: lesson.contentMd || '',
      durationMin: lesson.durationMin,
    });
    setLessonDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) return;
    if (editingLesson) {
      await updateLesson(editingLesson.id, lessonForm);
    } else {
      await createLesson(lessonSectionId, lessonForm);
    }
    setLessonDialogOpen(false);
  };

  const openQuizEditor = (lessonId: string, existingQuiz: any) => {
    setQuizLessonId(lessonId);
    setQuizQuestions(existingQuiz?.questions || [{ prompt: '', options: ['', '', '', ''], correctIndex: 0 }]);
    setQuizPassPercent(existingQuiz?.passPercent || 70);
  };

  const handleSaveQuiz = async () => {
    if (!quizLessonId) return;
    const validQuestions = quizQuestions.filter(q => q.prompt.trim() && q.options.some((o: string) => o.trim()));
    await upsertQuiz(quizLessonId, validQuestions, quizPassPercent);
    setQuizLessonId(null);
  };

  const addQuestion = () => {
    setQuizQuestions(prev => [...prev, { prompt: '', options: ['', '', '', ''], correctIndex: 0 }]);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6" />
                    Gestión de Cursos
                  </CardTitle>
                  <CardDescription>Crear y administrar módulos de aprendizaje</CardDescription>
                </div>
                <Button onClick={openNewModule} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Módulo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter */}
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="player">Jugadores</SelectItem>
                  <SelectItem value="coach">Entrenadores</SelectItem>
                </SelectContent>
              </Select>

              {/* Module list */}
              {filteredModules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No hay módulos creados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredModules.map(mod => (
                    <div key={mod.id} className="border rounded-xl overflow-hidden">
                      {/* Module header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                        <div className="flex items-center gap-3 min-w-0">
                          {mod.coverUrl ? (
                            <img src={mod.coverUrl} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{mod.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {mod.lessonCount} lecciones · {new Date(mod.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {mod.targetRole === 'player' ? 'Jugadores' : 'Entrenadores'}
                          </Badge>
                          <Badge variant={mod.isPublished ? 'default' : 'secondary'} className="text-xs">
                            {mod.isPublished ? 'Publicado' : 'Borrador'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={mod.isPublished}
                              onCheckedChange={(v) => updateModule(mod.id, { isPublished: v })}
                            />
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModule(mod)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteModule(mod.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Sections & lessons */}
                      <div className="px-4 py-3 space-y-3">
                        {mod.sections.map(section => (
                          <div key={section.id} className="border rounded-lg">
                            <div className="flex items-center justify-between px-3 py-2 bg-muted/20">
                              <span className="text-sm font-medium">{section.title}</span>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openNewLesson(section.id)}>
                                  <Plus className="h-3 w-3" /> Lección
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSection(section.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {section.lessons.length > 0 && (
                              <div className="divide-y">
                                {section.lessons.map(lesson => (
                                  <div key={lesson.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {lesson.videoUrl ? <Video className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                                      <span className="truncate">{lesson.title}</span>
                                      {lesson.durationMin > 0 && <span className="text-xs text-muted-foreground shrink-0">{lesson.durationMin}min</span>}
                                      {lesson.quiz && <Badge variant="secondary" className="text-xs shrink-0">Quiz</Badge>}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openQuizEditor(lesson.id, lesson.quiz)}>
                                        <span className="text-xs">📝</span>
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditLesson(lesson, section.id)}>
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteLesson(lesson.id)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs" onClick={() => {
                          const name = prompt('Nombre de la sección:');
                          if (name?.trim()) createSection(mod.id, name.trim());
                        }}>
                          <Plus className="h-3 w-3" /> Agregar Sección
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Module Dialog */}
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={moduleForm.title} onChange={e => setModuleForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Preparación Física" />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea value={moduleForm.description} onChange={e => setModuleForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div>
                <Label>URL de portada</Label>
                <Input value={moduleForm.coverUrl} onChange={e => setModuleForm(f => ({ ...f, coverUrl: e.target.value }))} placeholder="https://..." />
                {moduleForm.coverUrl && (
                  <img src={moduleForm.coverUrl} className="mt-2 h-20 rounded-lg object-cover" alt="Preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>
              <div>
                <Label>Destinatarios</Label>
                <Select value={moduleForm.targetRole} onValueChange={v => setModuleForm(f => ({ ...f, targetRole: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Jugadores</SelectItem>
                    <SelectItem value="coach">Entrenadores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveModule} disabled={!moduleForm.title.trim()}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Editar Lección' : 'Nueva Lección'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Calentamiento dinámico" />
              </div>
              <div>
                <Label>URL del video (YouTube/Vimeo)</Label>
                <Input value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <Label>Contenido de texto</Label>
                <Textarea value={lessonForm.contentMd} onChange={e => setLessonForm(f => ({ ...f, contentMd: e.target.value }))} rows={5} placeholder="Contenido de la lección..." />
              </div>
              <div>
                <Label>Duración (minutos)</Label>
                <Input type="number" value={lessonForm.durationMin} onChange={e => setLessonForm(f => ({ ...f, durationMin: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveLesson} disabled={!lessonForm.title.trim()}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quiz Editor Dialog */}
        <Dialog open={!!quizLessonId} onOpenChange={() => setQuizLessonId(null)}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editor de Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Label className="shrink-0">Aprobación:</Label>
                <Input type="number" className="w-20" value={quizPassPercent} onChange={e => setQuizPassPercent(parseInt(e.target.value) || 70)} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>

              {quizQuestions.map((q, qi) => (
                <Card key={qi} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Pregunta {qi + 1}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setQuizQuestions(prev => prev.filter((_, i) => i !== qi))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Pregunta..."
                    value={q.prompt}
                    onChange={e => {
                      const updated = [...quizQuestions];
                      updated[qi] = { ...updated[qi], prompt: e.target.value };
                      setQuizQuestions(updated);
                    }}
                  />
                  {q.options.map((opt: string, oi: number) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q${qi}`}
                        checked={q.correctIndex === oi}
                        onChange={() => {
                          const updated = [...quizQuestions];
                          updated[qi] = { ...updated[qi], correctIndex: oi };
                          setQuizQuestions(updated);
                        }}
                        className="shrink-0"
                      />
                      <Input
                        placeholder={`Opción ${oi + 1}`}
                        value={opt}
                        onChange={e => {
                          const updated = [...quizQuestions];
                          const opts = [...updated[qi].options];
                          opts[oi] = e.target.value;
                          updated[qi] = { ...updated[qi], options: opts };
                          setQuizQuestions(updated);
                        }}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </Card>
              ))}

              <Button variant="outline" size="sm" className="w-full gap-1" onClick={addQuestion}>
                <Plus className="h-3 w-3" /> Agregar Pregunta
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuizLessonId(null)}>Cancelar</Button>
              <Button onClick={handleSaveQuiz}>Guardar Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminCourses;
