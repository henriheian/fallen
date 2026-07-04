import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Settings() {
  const { user, logout } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Desconectado com sucesso!");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Erro ao desconectar");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerenciamento de conta e preferências</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="text-lg font-medium text-foreground">{user?.name || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg font-medium text-foreground">{user?.email || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Perfil</p>
            <p className="text-lg font-medium text-foreground capitalize">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Desconectando..." : "Sair da Conta"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
