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
import { Heart, Calendar, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ListeningSpaceBooking } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WHATSAPP_BASE = "+5548996929261";

export default function ListeningSpace() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

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

  const { data: bookings, isLoading } = useQuery<ListeningSpaceBooking[]>({
    queryKey: ["/api/listening-bookings"],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { scheduledAt: string; notes?: string }) => {
      return apiRequest("POST", "/api/listening-bookings", { ...data, durationMinutes: 60 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listening-bookings"] });
      toast({ title: "Sessão agendada com sucesso!" });
      setIsDialogOpen(false);
      setScheduledAt("");
      setNotes("");
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
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
    },
  });

  const handleSchedule = () => {
    if (!scheduledAt) {
      toast({
        title: "Data obrigatória",
        description: "Selecione a data e hora da sessão.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      scheduledAt,
      notes: notes.trim() || undefined,
    });
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Vim através do app Estabiliza e gostaria de agendar uma sessão no Espaço de Escuta.`
    );
    window.open(`https://wa.me/${WHATSAPP_BASE.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LoadingSkeleton type="card" count={2} />
    </div>;
  }

  const upcomingBookings = bookings?.filter(b => 
    b.status === "scheduled" && new Date(b.scheduledAt) > new Date()
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="💙 Espaço de Escuta"
        subtitle="Um momento para você ser ouvido"
        icon={<Heart className="w-8 h-8 text-primary" />}
      />

      {/* Info Card */}
      <Card className="mt-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">
            Criamos um ambiente seguro onde você pode falar livremente sobre o que está sentindo. 
            Nossa equipe está pronta para oferecer escuta ativa, acolhimento e orientação sobre os recursos disponíveis.
          </p>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Este não é um serviço de aconselhamento profissional ou terapia. 
              Para atendimento psicológico ou psiquiátrico, consulte nossos Profissionais Parceiros.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Card className="bg-accent/10 border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📱 Usuário do App?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent mb-2">60 minutos gratuitos!</p>
            <p className="text-sm text-muted-foreground">
              Como usuário do Estabiliza, você tem direito a uma sessão completa de 60 minutos sem custo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Agende sua sessão pelo app ou WhatsApp</li>
              <li>✓ Escolha o melhor horário para você</li>
              <li>✓ Seja ouvido em um ambiente seguro</li>
              <li>✓ Receba orientações sobre recursos</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Button */}
      <div className="mt-6 flex gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="flex-1" data-testid="button-schedule-listening">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Sessão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Espaço de Escuta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data e Hora</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  data-testid="input-schedule-time"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notas (opcional)</label>
                <Textarea
                  placeholder="Há algo específico que você gostaria de conversar?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  data-testid="input-schedule-notes"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ⏱️ Duração: 60 minutos gratuitos para usuários do app
              </p>
              <Button
                onClick={handleSchedule}
                disabled={createMutation.isPending}
                className="w-full"
                data-testid="button-confirm-schedule"
              >
                {createMutation.isPending ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          size="lg" 
          variant="outline" 
          onClick={openWhatsApp}
          data-testid="button-whatsapp-listening"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={2} className="mt-6" />
      ) : upcomingBookings.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Suas Sessões Agendadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="p-4 rounded-lg border hover-elevate">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {format(new Date(booking.scheduledAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.scheduledAt), "HH:mm", { locale: ptBR })} - 
                      {booking.durationMinutes} minutos
                    </p>
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{booking.notes}</p>
                    )}
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Agendado
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <EmptyState
              icon="📅"
              title="Nenhuma sessão agendada"
              description="Agende sua primeira sessão no Espaço de Escuta e tenha um momento para ser ouvido."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
