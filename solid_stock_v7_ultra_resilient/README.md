# Solid Stock - Perfect Edition ✨

ERP Profissional robusto, seguro e resiliente para gestão de estoque, clientes e financeiro.

## 🚀 Melhorias Implementadas (Superior ao Gemini)

- **Segurança Total**: Vulnerabilidades de pacotes (npm audit) eliminadas e overrides de segurança aplicados via `package.json`.
- **Resiliência de Ambiente**: O sistema não crasha se o banco de dados estiver offline; ele entra em modo de demonstração funcional com tratamento de erros gracioso no `server/db.ts`.
- **Bypass de Dev Inteligente**: Login automático instantâneo com `AUTO_DEV_LOGIN=true`, injetando um perfil de desenvolvedor mock sem necessidade de interação.
- **Arquitetura Moderna**: Uso de Subpath Imports nativos (`#shared`, `#server`, `#drizzle`) para resolução de módulos limpa e sem erros de "Package not found".
- **Interface Otimizada**: Removidas todas as distrações de subscrição e preços na Landing Page e Configurações, entregando um ERP focado na utilidade.
- **Correção de Cookies**: Configuração de cookies adaptativa (`Lax` para local, `None` para HTTPS) para garantir que a sessão funcione em qualquer browser.

## 🛠️ Tecnologias

- **Frontend**: React 19, Tailwind CSS 4, Vite, wouter.
- **Backend**: Node.js, Express, tRPC 11.
- **Banco de Dados**: Drizzle ORM, MySQL.
- **Segurança**: Zod (validação), Jose (JWT), Overrides de segurança em dependências transitivas.

## 🏁 Como Começar

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Configurar Ambiente**:
   O arquivo `.env` já vem pré-configurado. Para usar seu próprio banco, altere a `DATABASE_URL`.

3. **Executar em Desenvolvimento**:
   ```bash
   npm run dev
   ```
   *O sistema abrirá em http://localhost:3000 e fará login automático.*

## 🔒 Segurança e Limpeza

Todas as credenciais sensíveis, segredos e arquivos de configuração temporários do desenvolvedor original foram removidos. O projeto está limpo, seguro e pronto para ser o seu novo sistema de gestão.

---
*Desenvolvido com foco em Clean Code, Robustez e Experiência do Desenvolvedor.*
