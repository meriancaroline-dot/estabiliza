import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Award, Lock } from "lucide-react";
import type { Badge, UserBadge } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BadgeWithUserBadge extends Badge {
  earned?: boolean;
  earnedAt?: Date;
}

export default function Badges() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: allBadges, isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
    enabled: !!user,
  });

  const { data: userBadges, isLoading: userBadgesLoading } = useQuery<UserBadge[]>({
    queryKey: ["/api/user-badges"],
    enabled: !!user,
  });

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LoadingSkeleton type="card" count={2} />
    </div>;
  }

  const isLoading = badgesLoading || userBadgesLoading;

  // Combine badges with user badges
  const badgesWithStatus: BadgeWithUserBadge[] = (allBadges || []).map(badge => {
    const userBadge = userBadges?.find(ub => ub.badgeId === badge.id);
    return {
      ...badge,
      earned: !!userBadge,
      earnedAt: userBadge?.earnedAt,
    };
  });

  const earnedBadges = badgesWithStatus.filter(b => b.earned);
  const lockedBadges = badgesWithStatus.filter(b => !b.earned);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PageHeader
        title="Conquistas"
        subtitle="Celebre seu progresso com badges especiais"
        icon={<Award className="w-8 h-8 text-accent" />}
      />

      {/* Stats Card */}
      <Card className="mt-6 bg-gradient-to-r from-accent/10 to-chart-5/10">
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">
              {earnedBadges.length} / {badgesWithStatus.length}
            </p>
            <p className="text-muted-foreground">Conquistas desbloqueadas</p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : badgesWithStatus.length > 0 ? (
        <div className="space-y-8 mt-8">
          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Desbloqueadas</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedBadges.map((badge) => (
                  <Card key={badge.id} className="hover-elevate bg-gradient-to-br from-accent/5 to-transparent">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-2xl">
                          {badge.icon || "🏆"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{badge.name}</CardTitle>
                          {badge.earnedAt && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(badge.earnedAt), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Bloqueadas</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedBadges.map((badge) => (
                  <Card key={badge.id} className="opacity-60">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl grayscale">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{badge.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">Bloqueado</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      {badge.triggerValue && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Meta: {badge.triggerValue} {badge.triggerType?.includes("streak") ? "dias de sequência" : ""}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <EmptyState
              icon="🏆"
              title="Nenhuma conquista disponível"
              description="Continue usando o Estabiliza e desbloqueie conquistas especiais conforme seu progresso!"
            />
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            💡 <strong>Dica:</strong> Continue registrando seu humor, mantendo hábitos e usando o app para desbloquear novas conquistas!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
