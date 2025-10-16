import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, TrendingUp, Award, Calendar, BookOpen } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Seu Bem-Estar Importa</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Estabiliza
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cuide da sua saúde mental com um aplicativo completo: rastreie seu humor, 
            conecte-se com profissionais qualificados e encontre apoio quando precisar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Começar Agora
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              data-testid="button-learn-more"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Recursos Principais</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Rastreamento de Humor</h3>
              <p className="text-muted-foreground">
                Registre como você se sente todos os dias e visualize seu progresso com gráficos detalhados.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lembretes & Hábitos</h3>
              <p className="text-muted-foreground">
                Crie lembretes personalizados e desenvolva hábitos saudáveis com sistema de sequências.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Chat de Suporte</h3>
              <p className="text-muted-foreground">
                Converse em tempo real com nossa equipe de apoio quando precisar de ajuda.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-chart-4" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Profissionais Parceiros</h3>
              <p className="text-muted-foreground">
                Conecte-se com psicólogos, psiquiatras e advogados especializados em saúde mental.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-chart-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gamificação</h3>
              <p className="text-muted-foreground">
                Conquiste badges e celebre seu progresso na jornada de autoconhecimento.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Recursos Educacionais</h3>
              <p className="text-muted-foreground">
                Acesse artigos, vídeos e meditações guiadas para seu bem-estar.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já estão cuidando da sua saúde mental com o Estabiliza.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-cta-login"
            >
              Entrar Agora
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">WhatsApp: +55 48 99692-9261</p>
          <p>Instagram: @estabiliza</p>
          <p className="mt-4 text-sm">© 2025 Estabiliza. Seu bem-estar emocional.</p>
        </div>
      </footer>
    </div>
  );
}
