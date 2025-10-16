import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { MessageCircle, Send } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Support() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (data: { content: string; senderType: string }) => {
      return apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setContent("");
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
      toast({ title: "Erro ao enviar mensagem", description: error.message, variant: "destructive" });
    },
  });

  const handleSend = () => {
    if (!content.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    sendMutation.mutate({
      content: content.trim(),
      senderType: "user",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LoadingSkeleton type="card" count={2} />
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Chat de Suporte"
        subtitle="Converse com nossa equipe em tempo real"
        icon={<MessageCircle className="w-8 h-8 text-accent" />}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto mb-4 p-4 border rounded-lg bg-muted/20">
            {isLoading ? (
              <LoadingSkeleton type="list" count={3} />
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isUser = message.senderType === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/support-avatar.png" />
                          <AvatarFallback>📞</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {format(new Date(message.createdAt!), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {isUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {user.firstName?.[0] || user.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <EmptyState
                icon="💬"
                title="Nenhuma mensagem ainda"
                description="Envie uma mensagem para iniciar a conversa com nossa equipe de suporte."
              />
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending || !content.trim()}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-accent/5 border-accent/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Dica:</strong> Nossa equipe responde em horário comercial (9h às 18h). 
            Para emergências, entre em contato pelo WhatsApp: +55 48 99692-9261
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
