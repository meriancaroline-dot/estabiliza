import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Heart, ExternalLink } from "lucide-react";
import type { Professional } from "@shared/schema";

const WHATSAPP_BASE = "+5548996929261"; // From technical doc

const professionalIcons: Record<string, string> = {
  psychologist: "🧠",
  psychiatrist: "💊",
  lawyer: "⚖️",
};

const professionalTitles: Record<string, string> = {
  psychologist: "Psicólogos Especializados",
  psychiatrist: "Psiquiatras Parceiros",
  lawyer: "Advocacia Especializada",
};

const professionalDescriptions: Record<string, string> = {
  psychologist: "Profissionais preparados para te ouvir e acompanhar sua jornada de autoconhecimento e bem-estar emocional.",
  psychiatrist: "Atendimento especializado para diagnóstico, tratamento e acompanhamento medicamentoso quando necessário.",
  lawyer: "Apoio jurídico em casos relacionados à saúde mental, direitos trabalhistas e previdenciários.",
};

export default function Professionals() {
  const { data: professionals, isLoading } = useQuery<Professional[]>({
    queryKey: ["/api/professionals"],
  });

  const openWhatsApp = (number: string, professionalName: string) => {
    const message = encodeURIComponent(
      `Olá! Vim através do app Estabiliza e gostaria de agendar uma consulta com ${professionalName}.`
    );
    window.open(`https://wa.me/${number.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  const groupedProfessionals = professionals?.reduce((acc, prof) => {
    if (!acc[prof.type]) {
      acc[prof.type] = [];
    }
    acc[prof.type].push(prof);
    return acc;
  }, {} as Record<string, Professional[]>);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PageHeader
        title="Profissionais que Cuidam de Você"
        subtitle="Conectamos você a profissionais qualificados e especializados em saúde mental e direitos."
        icon={<Heart className="w-8 h-8 text-chart-4" />}
      />

      {isLoading ? (
        <LoadingSkeleton type="card" count={3} className="mt-6" />
      ) : professionals && professionals.length > 0 ? (
        <div className="space-y-8 mt-6">
          {Object.entries(groupedProfessionals || {}).map(([type, profs]) => (
            <div key={type}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{professionalIcons[type] || "👤"}</span>
                <div>
                  <h2 className="text-2xl font-bold">{professionalTitles[type] || type}</h2>
                  <p className="text-muted-foreground">
                    {professionalDescriptions[type] || "Profissionais especializados"}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profs.map((prof) => (
                  <Card key={prof.id} className="hover-elevate">
                    <CardHeader>
                      <CardTitle className="text-lg">{prof.name}</CardTitle>
                      {prof.specialty && (
                        <p className="text-sm text-muted-foreground">{prof.specialty}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {prof.description && (
                        <p className="text-sm text-muted-foreground mb-4">{prof.description}</p>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => openWhatsApp(prof.whatsappNumber, prof.name)}
                        data-testid={`button-contact-${prof.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Agendar via WhatsApp
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <EmptyState
              icon="🏥"
              title="Em breve"
              description="Estamos preparando uma lista de profissionais qualificados para você. Em breve teremos psicólogos, psiquiatras e advogados parceiros."
            />
          </CardContent>
        </Card>
      )}

      {/* CTA Section */}
      <Card className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
        <CardContent className="py-8">
          <h3 className="text-xl font-bold mb-2 text-center">Como Agendar?</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
            É simples! Entre em contato conosco pelo WhatsApp ou Chat e nossa equipe 
            agendará sua consulta com o profissional mais adequado para você.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openWhatsApp(WHATSAPP_BASE, "equipe Estabiliza")}
              data-testid="button-whatsapp-cta"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Agendar pelo WhatsApp
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = "/support"}
              data-testid="button-chat-cta"
            >
              💬 Conversar no Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
