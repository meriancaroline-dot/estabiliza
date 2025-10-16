import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Plus, Check, Flame, Trash2 } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Habit } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Habits() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<string>("daily");

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Não autorizado",
        description: "Você precisa fazer login. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, user, toast]);

  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; frequency: string }) => {
      return apiRequest("POST", "/api/habits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Hábito criado com sucesso!" });
      setIsDialogOpen(false);
      setTitle("");
      setDescription("");
      setFrequency("daily");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Erro ao criar hábito", description: error.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/habits/${id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "🎉 Parabéns! Hábito concluído hoje!" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/habits/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Hábito excluído!" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Preencha o título do hábito.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      title,
      description: description.trim() || undefined,
      frequency,
    });
  };

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LoadingSkeleton type="card" count={2} />
    </div>;
  }

  const activeHabits = habits?.filter(h => h.isActive) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Hábitos"
        subtitle="Desenvolva hábitos saudáveis e acompanhe seu progresso"
        icon={<CalendarIcon className="w-8 h-8 text-secondary" />}
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-habit">
                <Plus className="w-4 h-4 mr-2" />
                Novo Hábito
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Hábito</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título</label>
                  <Input
                    placeholder="Ex: Meditar 10 minutos"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-habit-title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descrição (opcional)</label>
                  <Textarea
                    placeholder="Detalhes sobre o hábito..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    data-testid="input-habit-description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Frequência</label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger data-testid="select-habit-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="w-full"
                  data-testid="button-save-habit"
                >
                  {createMutation.isPending ? "Salvando..." : "Criar Hábito"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <LoadingSkeleton type="card" count={3} className="mt-6" />
      ) : activeHabits.length > 0 ? (
        <div className="grid gap-4 mt-6">
          {activeHabits.map((habit) => {
            const canCompleteToday = !habit.lastCompletedAt || 
              format(new Date(habit.lastCompletedAt), "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd");

            return (
              <Card key={habit.id} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Button
                      size="icon"
                      variant={canCompleteToday ? "outline" : "secondary"}
                      onClick={() => canCompleteToday && completeMutation.mutate(habit.id)}
                      disabled={!canCompleteToday || completeMutation.isPending}
                      data-testid={`button-complete-habit-${habit.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>

                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{habit.title}</h4>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Flame className="w-4 h-4 text-chart-5" />
                          <span className="font-medium">{habit.currentStreak || 0} dias</span>
                          <span className="text-muted-foreground">sequência atual</span>
                        </div>
                        {habit.longestStreak && habit.longestStreak > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Recorde: {habit.longestStreak} dias
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Frequência: {habit.frequency === "daily" ? "Diária" : habit.frequency === "weekly" ? "Semanal" : "Personalizada"}
                      </p>
                      {habit.lastCompletedAt && (
                        <p className="text-xs text-muted-foreground">
                          Última conclusão: {format(new Date(habit.lastCompletedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(habit.id)}
                      data-testid={`button-delete-habit-${habit.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <EmptyState
              icon="📅"
              title="Nenhum hábito criado"
              description="Crie seu primeiro hábito e comece a construir uma rotina saudável."
              actionLabel="Criar Hábito"
              onAction={() => setIsDialogOpen(true)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
