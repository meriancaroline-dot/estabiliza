import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, Check, Trash2 } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Reminder } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Reminders() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

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

  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; scheduledTime: string }) => {
      return apiRequest("POST", "/api/reminders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Lembrete criado com sucesso!" });
      setIsDialogOpen(false);
      setTitle("");
      setDescription("");
      setScheduledTime("");
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
      toast({ title: "Erro ao criar lembrete", description: error.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/reminders/${id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Lembrete marcado como completo!" });
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
      return apiRequest("DELETE", `/api/reminders/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Lembrete excluído!" });
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
    if (!title.trim() || !scheduledTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e a data/hora do lembrete.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      title,
      description: description.trim() || undefined,
      scheduledTime,
    });
  };

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LoadingSkeleton type="card" count={2} />
    </div>;
  }

  const pendingReminders = reminders?.filter(r => !r.isCompleted) || [];
  const completedReminders = reminders?.filter(r => r.isCompleted) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Lembretes"
        subtitle="Mantenha-se organizado com seus lembretes"
        icon={<Bell className="w-8 h-8 text-primary" />}
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-reminder">
                <Plus className="w-4 h-4 mr-2" />
                Novo Lembrete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Lembrete</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título</label>
                  <Input
                    placeholder="Ex: Tomar medicação"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-reminder-title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descrição (opcional)</label>
                  <Textarea
                    placeholder="Detalhes adicionais..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    data-testid="input-reminder-description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Data e Hora</label>
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    data-testid="input-reminder-time"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="w-full"
                  data-testid="button-save-reminder"
                >
                  {createMutation.isPending ? "Salvando..." : "Criar Lembrete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <LoadingSkeleton type="card" count={3} className="mt-6" />
      ) : reminders && reminders.length > 0 ? (
        <div className="space-y-6 mt-6">
          {/* Pending Reminders */}
          {pendingReminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pendentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover-elevate"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{reminder.title}</h4>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(reminder.scheduledTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => completeMutation.mutate(reminder.id)}
                        data-testid={`button-complete-${reminder.id}`}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(reminder.id)}
                        data-testid={`button-delete-${reminder.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Concluídos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30 opacity-60"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold line-through">{reminder.title}</h4>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(reminder.scheduledTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(reminder.id)}
                      data-testid={`button-delete-${reminder.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <EmptyState
              icon="🔔"
              title="Nenhum lembrete criado"
              description="Crie seu primeiro lembrete para se manter organizado."
              actionLabel="Criar Lembrete"
              onAction={() => setIsDialogOpen(true)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
