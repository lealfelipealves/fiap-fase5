# API de Gestão de Veículos

API REST para gerenciamento de vendas de veículos com autenticação e fluxo de pagamento assíncrono.

## Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **Linguagem**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: AWS Cognito
- **Documentação**: Swagger/OpenAPI

## Arquitetura

```
src/
├── modules/          # Módulos de domínio (auth, clientes, veiculos, vendas)
├── core/             # Lógica de negócio (sagas, errors, security)
├── infra/            # Infraestrutura (prisma, messaging)
├── app/              # Configuração HTTP (server, middlewares, routes)
└── plugins/          # Plugins Fastify (swagger, sensible)
```

## Funcionalidades

- **Autenticação**: Registro e login via AWS Cognito com JWT
- **Clientes**: CRUD de clientes vinculados ao Cognito
- **Veículos**: Gestão de estoque com controle de status
- **Vendas**: Fluxo completo de venda com estados (RESERVADO → CODIGO_GERADO → PAGO → RETIRADO)
- **Saga Pattern**: Orquestração de compra com SQS
- **API Documentation**: Swagger UI disponível

## Pré-requisitos

- Node.js >= 18
- PostgreSQL
- AWS Account (Cognito + SQS)

## Configuração

### 1. Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
AWS_REGION="us-east-1"
COGNITO_USER_POOL_ID=""
COGNITO_CLIENT_ID=""
COGNITO_CLIENT_SECRET=""
```

### 2. Instalação

```bash
npm install
```

### 3. Database

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy

# Reset (apaga tudo)
npx prisma migrate reset
```

## Execução

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

### Testes

```bash
npm test
```

## API Endpoints

### Auth

- `POST /auth/register` - Cadastro de usuário
- `POST /auth/login` - Login

### Clientes

- `GET /clientes` - Listar clientes
- `GET /clientes/:id` - Buscar cliente
- `POST /clientes` - Criar cliente
- `PUT /clientes/:id` - Atualizar cliente
- `DELETE /clientes/:id` - Remover cliente

### Veículos

- `GET /veiculos` - Listar veículos
- `GET /veiculos/:id` - Buscar veículo
- `POST /veiculos` - Criar veículo
- `PUT /veiculos/:id` - Atualizar veículo
- `DELETE /veiculos/:id` - Remover veículo

### Vendas

- `GET /vendas` - Listar vendas
- `GET /vendas/:id` - Buscar venda
- `POST /vendas` - Criar venda
- `PUT /vendas/:id` - Atualizar venda

## Documentação

Acesse `http://localhost:3000/docs` para Swagger UI.

## Modelo de Dados

### Veiculo

- Status: `DISPONIVEL` | `RESERVADO` | `VENDIDO`

### Cliente

- Vinculado ao Cognito via `cognitoSub`

### Venda

- Estados: `RESERVADO` → `CODIGO_GERADO` → `PAGO` → `RETIRADO` | `CANCELADO`
- Geração de código de pagamento via saga

## Scripts

```bash
npm run dev          # Desenvolvimento com watch
npm run dev:tsx      # Desenvolvimento com tsx
npm start            # Produção
npm test             # Testes
npm run build:ts     # Build TypeScript
```

## License

ISC
