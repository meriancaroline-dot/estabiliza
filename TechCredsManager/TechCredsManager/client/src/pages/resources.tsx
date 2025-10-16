import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { BookOpen, Search, ExternalLink, Clock, FileText, Video, Headphones } from "lucide-react";
import type { EducationalResource } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  audio_meditation: Headphones,
};

const categoryLabels: Record<string, string> = {
  article: "Artigos",
  video: "Vídeos",
  audio_meditation: "Meditações",
};

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: resources, isLoading } = useQuery<EducationalResource[]>({
    queryKey: ["/api/resources"],
  });

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
    return matchesSearch && matchesCategory && resource.isActive;
  });

  const openResource = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PageHeader
        title="Recursos Educacionais"
        subtitle="Explore artigos, vídeos e meditações para seu bem-estar"
        icon={<BookOpen className="w-8 h-8 text-destructive" />}
      />

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-resources"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger data-testid="select-category-filter">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="article">Artigos</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="audio_meditation">Meditações</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : filteredResources && filteredResources.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredResources.map((resource) => {
            const Icon = categoryIcons[resource.category] || BookOpen;
            return (
              <Card key={resource.id} className="hover-elevate flex flex-col">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoryLabels[resource.category] || resource.category}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {resource.description}
                    </p>
                  )}
                  {resource.durationMinutes && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3 h-3" />
                      <span>{resource.durationMinutes} min</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-auto"
                    onClick={() => resource.url && openResource(resource.url)}
                    disabled={!resource.url}
                    data-testid={`button-open-resource-${resource.id}`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <EmptyState
              icon="📚"
              title="Nenhum recurso encontrado"
              description={searchTerm || categoryFilter !== "all" 
                ? "Tente ajustar seus filtros de busca."
                : "Estamos preparando conteúdos educacionais para você. Em breve teremos artigos, vídeos e meditações guiadas."
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="py-8 text-center">
          <h3 className="text-xl font-bold mb-2">Compartilhe Conhecimento</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Conhece algum recurso educacional que ajudou você? Compartilhe conosco pelo chat de suporte!
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/support"}
            data-testid="button-share-resource"
          >
            💬 Sugerir Recurso
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
