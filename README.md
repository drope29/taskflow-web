# 🚀 TaskFlow - Gerenciador de Tarefas Acessível

**TaskFlow** é uma plataforma moderna, intuitiva e completamente acessível para gerenciamento de tarefas, desenvolvida com **Next.js** e **Firebase**. O projeto implementa os mais altos padrões de acessibilidade web conforme as diretrizes **WCAG 2.1 nível AA**.

## ✨ Características Principais

### 📋 Funcionalidades de Gestão de Tarefas

- **Kanban Interativo**: Arraste e solte tarefas entre as colunas "A Fazer", "Fazendo" e "Concluído"
- **Dashboard Analítico**: Visualização de métricas e progresso de tarefas
- **Calendário Integrado**: Planeje tarefas por data com integração FullCalendar
- **Lista de Tarefas**: Gerenciamento completo de tarefas com prioridades e datas de vencimento
- **Autenticação**: Login e registro seguro via Firebase

### ♿ Acessibilidade (Destaque Principal)

- **🤟 VLibras Integrado**: Tradução em tempo real para Língua Brasileira de Sinais (Libras)
- **🎨 4 Temas Inclusivos**:
  - **Padrão**: Design moderno e limpo
  - **Modo Escuro**: Reduz cansaço visual
  - **Alto Contraste**: Suporte para deficiência visual
  - **Tema para Dislexia**: Fonte otimizada (OpenSans) e cores warm
- **📝 Ajuste de Tamanho de Fonte**: 3 níveis (Normal, Grande, Muito Grande)
- **⚡ Redução de Movimento**: Desativa animações para usuários com vestibulopatia
- **⌨️ Navegação Completa por Teclado**: 
  - Tab/Shift+Tab para navegação
  - Enter/Espaço para ativar botões
  - Suporte a drag-and-drop via teclado
- **🔊 Suporte a Leitores de Tela**: ARIA labels, roles e live regions
- **🎯 Configuração Rápida**: Atalho Ctrl+K para acessar preferências

## 🛠️ Stack Tecnológico

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Next.js** | 16.0.4 | Framework React com SSR/SSG |
| **React** | 18.3.1 | Biblioteca UI |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Estilização responsiva |
| **Firebase** | 12.6.0 | Autenticação e Banco de Dados |
| **@dnd-kit** | 6.3.1 | Drag-and-drop acessível |
| **FullCalendar** | 6.1.19 | Calendário interativo |
| **React Hook Form** | 7.67.0 | Gerenciamento de formulários |
| **Lucide React** | 0.555.0 | Ícones SVG |
| **@djpfs/react-vlibras** | 2.0.2 | Tradução Libras |
| **Tremor React** | 3.18.7 | Componentes de dashboard |

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Firebase

### Passos

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/drope29/taskflow-web.git
   cd taskflow-web
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Execute o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**:
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🎯 Estrutura do Projeto

```
taskflow-web/
├── app/
│   ├── accessibility/          # Provider de temas e acessibilidade
│   │   └── theme-provider.tsx
│   ├── calendar/               # Página de calendário
│   ├── dashboard/              # Dashboard com métricas
│   ├── kanban/                 # Quadro Kanban
│   ├── login/                  # Autenticação
│   ├── register/               # Registro de usuário
│   ├── tasks/                  # Gerenciamento de tarefas
│   ├── layout.tsx              # Layout raiz com providers
│   ├── page.tsx                # Página inicial
│   └── globals.css             # Estilos globais
│
├── components/
│   ├── AccessibilityToolbar.tsx    # Barra flutuante de acessibilidade
│   ├── Header.tsx                  # Cabeçalho da aplicação
│   ├── Footer.tsx                  # Rodapé
│   └── VlibrasClient.tsx           # Widget VLibras
│
├── hooks/
│   ├── useAccessibility.ts     # Hook para gerenciar temas e acessibilidade
│   └── useAuth.tsx             # Hook para autenticação
│
├── lib/
│   ├── firebase.ts             # Configuração do Firebase
│   └── vlibras.tsx             # Setup do VLibras
│
├── types/
│   ├── index.ts                # Tipos compartilhados
│   └── ...
│
└── public/                      # Arquivos estáticos
```

## 🚀 Como Usar

### 1. **Página Inicial**
- Apresentação visual com recursos de acessibilidade
- Botão de acesso rápido à configuração de acessibilidade
- Links para login/registro

### 2. **Autenticação**
- **Login**: Faça login com email e senha
- **Registro**: Crie uma nova conta
- Integração com Firebase Authentication

### 3. **Dashboard**
- Visão geral de tarefas pendentes, em progresso e concluídas
- Gráficos analíticos
- Links para outras seções

### 4. **Kanban Board**
- Arraste tarefas entre colunas de status
- Suporte completo a teclado e leitores de tela
- Adicione tarefas à visualização Kanban a partir da lista lateral

### 5. **Calendário**
- Visualize tarefas por data
- Interface interativa com FullCalendar
- Navegação por período

### 6. **Gerenciador de Tarefas**
- Crie, edite e delete tarefas
- Defina prioridades e datas de vencimento
- Acompanhe o status

### 7. **Acessibilidade (Ctrl+K)**
- **Temas**: Escolha entre 4 opções
- **Tamanho de Fonte**: Ajuste para necessidades visuais
- **Movimento Reduzido**: Desative animações
- **Persistência**: Preferências salvas em localStorage

## ♿ Conformidade de Acessibilidade

### Diretrizes Implementadas (WCAG 2.1 AA)

| Critério | Implementação |
|----------|---------------|
| **Contraste** | Razão de 4.5:1 para texto (AA) e 3:1 para ícones |
| **Teclado** | Navegação 100% via teclado em todas as seções |
| **Foco Visual** | Ring focus visível em todos os elementos interativos |
| **ARIA** | Labels, roles, live regions, aria-pressed, aria-expanded |
| **Semântica HTML** | Uso correto de heading, main, nav, role="region" |
| **Alternativas Textuais** | Descrições aria-label para ícones e SVGs |
| **Redução de Movimento** | Prefere-reduce-motion respeitado |
| **Cores Não Únicos** | Padrões além de cor (ícones, texto) |

### Recursos de Acessibilidade

- ✅ VLibras para Libras em tempo real
- ✅ Temas com contraste otimizado
- ✅ Fonte dyslexia-friendly (OpenSans)
- ✅ Navegação por teclado completa
- ✅ Suporte a leitores de tela (NVDA, JAWS, VoiceOver)
- ✅ Atalho rápido Ctrl+K
- ✅ Redução de movimento
- ✅ Drag-and-drop via teclado

## 📚 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev      # Inicia servidor de desenvolvimento

# Produção
npm run build    # Compila a aplicação
npm start        # Inicia servidor de produção

# Linting
npm run lint     # Verifica código com ESLint
```

## 🔐 Configuração Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Habilite autenticação por email/senha
4. Configure Firestore Database
5. Copie credenciais para `.env.local`

### Estrutura Firestore

```
tasks/
  └── {taskId}
      ├── title: string
      ├── description: string
      ├── status: 'todo' | 'in-progress' | 'done'
      ├── priority: 'low' | 'medium' | 'high'
      ├── dueDate: timestamp
      ├── userId: string
      ├── inKanban: boolean
      └── createdAt: timestamp
```

## 🎨 Personalização

### Adicionar Novo Tema
Edite `hooks/useAccessibility.ts` e `components/AccessibilityToolbar.tsx`:

```typescript
// Adicione à lista de temas
const themes = [
  { id: 'meuu-tema', name: 'Meu Tema', icon: IconComponent },
  // ...
];

// Implemente classes no seu componente
const getButtonClasses = (theme: string) => {
  if (theme === 'meu-tema') {
    return 'bg-custom-color text-white';
  }
  // ...
};
```

### Ajustar Paleta de Cores
- Edite `app/globals.css` para modificar cores do Tailwind
- Cores dinâmicas estão em `getThemeColors()` em cada página

## 🐛 Troubleshooting

### "Firebase não inicializa"
- Verifique `.env.local` com dados corretos
- Confirme que projeto Firebase existe

### "VLibras não aparece"
- Verifique internet (VLibras é CDN)
- Verifique console para erros

### "Drag-and-drop não funciona"
- Use navegador moderno (Chrome, Firefox, Safari)
- Teste com teclado (Espaço/Enter)

### "Leitura de tela não funciona"
- Ative leitor de tela do SO (NVDA, JAWS, VoiceOver)
- Certifique-se que JavaScript está habilitado

## 📝 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Autores

**Pedro Henrique** - [@drope29](https://github.com/drope29)

**João Pedro** - [@JPonchiroli](https://github.com/JPonchiroli)

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, [abra uma issue](https://github.com/drope29/taskflow-web/issues).

---

<div align="center">

**Made with ❤️ for Accessibility**

Se este projeto ajudou você, considere dar uma ⭐ no GitHub!

</div>
