import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Moon, Sun, Monitor, LogOut, Mail } from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
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

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LoadingSkeleton type="card" count={2} />
    </div>;
  }

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Perfil"
        subtitle="Gerencie suas informações e preferências"
        icon={<User className="w-8 h-8 text-primary" />}
      />

      {/* User Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.firstName || "Usuário"}
              </h3>
              {user.email && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tema</label>
              <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                <SelectTrigger data-testid="select-theme">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <ThemeIcon className="w-4 h-4" />
                      <span>
                        {theme === "light" && "Claro"}
                        {theme === "dark" && "Escuro"}
                        {theme === "system" && "Sistema"}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      <span>Claro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <span>Escuro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span>Sistema</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Escolha entre tema claro, escuro ou automático (segue as preferências do seu dispositivo)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Sair da conta</p>
                <p className="text-sm text-muted-foreground">
                  Desconectar da sua conta Estabiliza
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sobre o Estabiliza</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>WhatsApp:</strong> +55 48 99692-9261</p>
            <p><strong>Instagram:</strong> @estabiliza</p>
            <p className="mt-4 pt-4 border-t">
              © 2025 Estabiliza. Seu bem-estar emocional.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
