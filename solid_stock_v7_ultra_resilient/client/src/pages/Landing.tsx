import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, BarChart3, Users, Smartphone, Headphones } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";

export default function Landing() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStartFree = () => {
    window.location.href = getLoginUrl();
  };

  const handleViewDemo = () => {
    alert("Demo será disponibilizada em breve! Por enquanto, use 'Acessar Agora'.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header/Nav */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Solid Stock</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <button 
              onClick={() => handleScrollToSection("features")}
              className="text-muted-foreground hover:text-foreground transition"
            >
              Recursos
            </button>
            <button 
              onClick={() => handleScrollToSection("faq")}
              className="text-muted-foreground hover:text-foreground transition"
            >
              FAQ
            </button>
            <Button 
              onClick={handleStartFree}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Entrar
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge className="mx-auto" variant="outline">✨ Sistema de Gestão Completo</Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            ERP Profissional para Sua Empresa
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gerencie estoque, clientes, vendas e financeiro em um único lugar. Simples, rápido e seguro.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg"
              className="h-12 px-8"
              onClick={handleStartFree}
            >
              Acessar Agora <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="h-12 px-8"
              onClick={handleViewDemo}
            >
              Ver Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">Controle total do seu negócio sem complicações.</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Recursos Poderosos</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Tudo que você precisa para gerenciar sua empresa</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <BarChart3 className="w-8 h-8" />,
              title: "Dashboard em Tempo Real",
              description: "Visualize KPIs, alertas e tendências em um único lugar"
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Segurança Enterprise",
              description: "Autenticação, criptografia, backup automático e audit log"
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Implementação Rápida",
              description: "Configurado em menos de 1 hora. Sem consultoria necessária"
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Gestão de Clientes",
              description: "Cadastro completo, controle de crédito e histórico de transações"
            },
            {
              icon: <Smartphone className="w-8 h-8" />,
              title: "Acesso Mobile",
              description: "Interface responsiva para gerenciar de qualquer lugar"
            },
            {
              icon: <Headphones className="w-8 h-8" />,
              title: "Suporte Dedicado",
              description: "Time especializado para ajudar no sucesso do seu negócio"
            }
          ].map((feature, i) => (
            <Card key={i} className="border-border hover:shadow-lg transition">
              <CardHeader>
                <div className="text-primary mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Perguntas Frequentes</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: "Como começo a usar o Solid Stock?",
              a: "Basta clicar em 'Acessar Agora' e realizar o login. Você terá acesso imediato a todas as funcionalidades."
            },
            {
              q: "Meus dados estão seguros?",
              a: "Sim. Usamos criptografia de nível enterprise, backup automático diário e total privacidade dos seus dados."
            },
            {
              q: "O sistema funciona em dispositivos móveis?",
              a: "Sim! O Solid Stock é totalmente responsivo e funciona perfeitamente em smartphones e tablets."
            },
            {
              q: "Qual é o tempo de implementação?",
              a: "Imediato. Você pode começar a cadastrar seus produtos e clientes em poucos minutos."
            }
          ].map((item, i) => (
            <Card 
              key={i} 
              className="border-border cursor-pointer hover:shadow-md transition"
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  {item.q}
                  <span className="text-primary">{expandedFaq === i ? "−" : "+"}</span>
                </CardTitle>
              </CardHeader>
              {expandedFaq === i && (
                <CardContent>
                  <p className="text-muted-foreground">{item.a}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-12 space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Pronto para Transformar Seu Negócio?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Comece a gerenciar sua empresa de forma profissional hoje mesmo.</p>
          <Button 
            size="lg"
            className="px-8 py-4 text-lg"
            onClick={handleStartFree}
          >
            Acessar Agora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="font-bold mb-2">Solid Stock</h3>
            <p className="text-sm text-muted-foreground">ERP profissional para empresas em crescimento</p>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Solid Stock. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
