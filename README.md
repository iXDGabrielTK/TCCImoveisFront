# 🏠 TCC Imóveis - Front-end

Este repositório contém o front-end do sistema **Sistema de Administração de Imóveis**, desenvolvido como parte do Trabalho de Conclusão de Curso em Análise e Desenvolvimento de Sistemas (UMFG).

🔗 **Repositório GitHub:** [TCCImoveisFront](https://github.com/iXDGabrielTK/TCCImoveisFront)

## 🧩 Tecnologias Utilizadas

- [React](https://reactjs.org/) com [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) para bundling e dev server
- [Axios](https://axios-http.com/) para comunicação HTTP
- [React Router DOM](https://reactrouter.com/) para gerenciamento de rotas
- [TailwindCSS](https://tailwindcss.com/) (se utilizado)
- [Docker](https://www.docker.com/) para build e deploy

---

## 🚀 Funcionalidades Principais

🔒 **Autenticação de Usuários**  
👤 Cadastro e login de visitantes e funcionários  
🏘️ Visualização de imóveis disponíveis  
📅 Agendamento de visitas com controle de disponibilidade  
🧾 Geração de relatórios de uso, vistoria e agendamentos  
📸 Upload e visualização de fotos dos imóveis  
📈 Controle de acesso baseado em tipo de usuário  

> ⚙️ Toda a comunicação é feita com o back-end Java (Spring Boot), que expõe a API REST consumida por este front-end.

---

## 📦 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/iXDGabrielTK/TCCImoveisFront.git

# Acesse o diretório
cd TCCImoveisFront

# Instale as dependências
npm install

# Rode o projeto em ambiente de desenvolvimento
npm run dev

🐳 Build com Docker
Para criar a imagem Docker do front-end:

# Build da imagem
docker build -t tccimoveis-front .

# Rodar container
docker run -p 5173:5173 tccimoveis-front
Certifique-se de que a API esteja acessível no ambiente Docker ou configure corretamente a variável de ambiente VITE_API_URL.

🛠️ Scripts Disponíveis
Comando	Descrição
npm run dev	Inicia o servidor de desenvolvimento
npm run build	Gera a versão de produção
npm run preview	Pré-visualização da build

🌐 Estrutura de Pastas
📁 src
 ┣ 📁 assets       # Imagens e ícones
 ┣ 📁 components   # Componentes reutilizáveis
 ┣ 📁 pages        # Telas principais
 ┣ 📁 services     # Conexão com API (axios)
 ┣ 📁 routes       # Definição de rotas
 ┗ 📄 App.tsx      # Componente principal

 📌 Sobre o Projeto
Esse sistema foi desenvolvido para automatizar a administração de imóveis da empresa Bemco, permitindo que usuários realizem consultas, agendamentos e interações com imóveis disponíveis para locação.

Acadêmicos responsáveis:
Gabriel Ferrari Tanaka – gabrielferraritanaka@gmail.com

Caio Fabricio Dantas Ribeiro – caaiofabricio07@gmail.com

📃 Licença
Este projeto é apenas para fins acadêmicos e não possui licença comercial associada.

💬 Contribuindo
Pull requests são bem-vindos! Se quiser sugerir melhorias ou reportar bugs, fique à vontade para abrir uma issue.