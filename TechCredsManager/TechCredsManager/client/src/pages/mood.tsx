import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { MoodEmoji } from "@/components/MoodEmoji";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { MoodEntry } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const moodOptions: Array<{ value: 1 | 2 | 3 | 4 | 5; label: string }> = [
  { value: 1, label: "Muito triste" },
  { value: 2, label: "Triste" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Feliz" },
  { value: 5, label: "Muito feliz" },
];

export default function Mood() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [note, setNote] = useState("");

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

  const { data: moodHistory, isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/moods"],
    enabled: !!user,
  });

  const createMoodMutation = useMutation({
    mutationFn: async (data: { mood: number; note?: string }) => {
      return apiRequest("POST", "/api/moods", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/moods/recent"] });
      toast({
        title: "Humor registrado!",
        description: "Seu humor foi salvo com sucesso.",
      });
      setSelectedMood(null);
      setNote("");
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
      toast({
        title: "Erro ao registrar humor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) {
      toast({
        title: "Selecione um humor",
        description: "Por favor, escolha como você está se sentindo.",
        variant: "destructive",
      });
      return;
    }

    createMoodMutation.mutate({
      mood: selectedMood,
      note: note.trim() || undefined,
    });
  };

  const chartData = moodHistory
    ?.slice(-30)
    .map(entry => ({
      date: format(new Date(entry.createdAt!), "dd/MM", { locale: ptBR }),
      mood: entry.mood,
    })) || [];

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LoadingSkeleton type="card" count={2} />
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Rastreamento de Humor"
        subtitle="Como você está se sentindo hoje?"
        icon={<TrendingUp className="w-8 h-8 text-primary" />}
      />

      {/* Mood Selector */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Registre seu humor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedMood(option.value)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                  hover-elevate active-elevate-2
                  ${selectedMood === option.value 
                    ? "border-primary bg-primary/5 scale-110" 
                    : "border-border"
                  }
                `}
                data-testid={`button-mood-${option.value}`}
              >
                <MoodEmoji mood={option.value} size="lg" />
                <span className="text-xs text-muted-foreground text-center">
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Notas (opcional)
            </label>
            <Textarea
              placeholder="Como foi seu dia? O que você está sentindo?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              maxLength={500}
              data-testid="input-mood-note"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {note.length}/500 caracteres
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || createMoodMutation.isPending}
            className="w-full"
            data-testid="button-save-mood"
          >
            {createMoodMutation.isPending ? "Salvando..." : "Salvar Humor"}
          </Button>
        </CardContent>
      </Card>

      {/* Mood Chart */}
      {isLoading ? (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <LoadingSkeleton type="card" />
          </CardContent>
        </Card>
      ) : moodHistory && moodHistory.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Histórico de Humor (últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <EmptyState
              icon="📊"
              title="Nenhum registro ainda"
              description="Comece a registrar seu humor diariamente para visualizar seu progresso."
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      {moodHistory && moodHistory.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Registros Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moodHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <MoodEmoji mood={entry.mood as 1 | 2 | 3 | 4 | 5} size="md" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.createdAt!), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {entry.note && (
                      <p className="text-sm mt-1">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
