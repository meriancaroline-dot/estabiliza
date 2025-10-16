import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { MoodEmoji } from "@/components/MoodEmoji";
import { TrendingUp, Calendar, Award, MessageCircle, Plus } from "lucide-react";
import { useLocation } from "wouter";
import type { MoodEntry, Habit, UserBadge } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
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

  // Fetch user stats
  const { data: recentMoods, isLoading: moodsLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/moods/recent"],
    enabled: !!user,
  });

  const { data: habits, isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
    enabled: !!user,
  });

  const { data: userBadges, isLoading: badgesLoading } = useQuery<UserBadge[]>({
    queryKey: ["/api/user-badges"],
    enabled: !!user,
  });

  if (authLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">
      <LoadingSkeleton type="card" count={3} />
    </div>;
  }

  const activeHabits = habits?.filter(h => h.isActive) || [];
  const avgMood = recentMoods && recentMoods.length > 0 
    ? Math.round(recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Olá, {user.firstName || "bem-vindo(a)"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Como você está se sentindo hoje?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setLocation("/mood")}
          data-testid="button-quick-mood"
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-sm">Registrar Humor</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setLocation("/habits")}
          data-testid="button-quick-habits"
        >
          <Calendar className="w-6 h-6" />
          <span className="text-sm">Meus Hábitos</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setLocation("/support")}
          data-testid="button-quick-chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm">Chat Suporte</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setLocation("/professionals")}
          data-testid="button-quick-professionals"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm">Profissionais</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Mood Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Humor Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moodsLoading ? (
              <LoadingSkeleton type="text" count={2} />
            ) : avgMood ? (
              <div className="flex items-center gap-4">
                <MoodEmoji mood={avgMood as 1 | 2 | 3 | 4 | 5} size="lg" />
                <div>
                  <p className="text-2xl font-bold">{avgMood}/5</p>
                  <p className="text-sm text-muted-foreground">Média dos últimos 7 dias</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum registro ainda</p>
            )}
          </CardContent>
        </Card>

        {/* Habits Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              Hábitos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {habitsLoading ? (
              <LoadingSkeleton type="text" count={2} />
            ) : (
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {activeHabits.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeHabits.length === 1 ? "hábito em andamento" : "hábitos em andamento"}
                </p>
                {activeHabits.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Maior sequência: {Math.max(...activeHabits.map(h => h.longestStreak || 0))} dias
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badgesLoading ? (
              <LoadingSkeleton type="text" count={2} />
            ) : (
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {userBadges?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userBadges?.length === 1 ? "badge conquistado" : "badges conquistados"}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs mt-2"
                  onClick={() => setLocation("/badges")}
                  data-testid="button-view-badges"
                >
                  Ver todas →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/5">
          <CardHeader>
            <CardTitle>💙 Espaço de Escuta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Reserve um momento para ser ouvido. Usuários do app têm 60 minutos gratuitos!
            </p>
            <Button 
              onClick={() => setLocation("/listening-space")}
              data-testid="button-listening-space"
            >
              Agendar Sessão
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-chart-4/5">
          <CardHeader>
            <CardTitle>📚 Recursos Educacionais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Explore artigos, vídeos e meditações guiadas para seu bem-estar.
            </p>
            <Button 
              variant="secondary"
              onClick={() => setLocation("/resources")}
              data-testid="button-resources"
            >
              Explorar Recursos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
