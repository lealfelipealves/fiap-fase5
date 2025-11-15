import { env } from "@/app/config/env";
import {
  AdminConfirmSignUpCommand,
  AdminInitiateAuthCommand,
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";
import { prisma } from "../../infra/prisma/client";

const cognito = new CognitoIdentityProviderClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export class AuthService {
  private userPoolId = env.COGNITO_USER_POOL_ID;
  private clientId = env.COGNITO_CLIENT_ID;
  private clientSecret = env.COGNITO_CLIENT_SECRET;

  private calculateSecretHash(username: string): string {
    return createHmac("sha256", this.clientSecret)
      .update(username + this.clientId)
      .digest("base64");
  }

  /**
   * Registro de um novo cliente:
   * - Cria usuário no Cognito (signUp)
   * - Confirma o usuário (adminConfirm, para simplificar o desafio)
   * - Cria registro Cliente no Postgres
   */
  async registerCliente(input: {
    nome: string;
    email: string;
    senha: string;
    documento?: string;
    telefone?: string;
    endereco?: string;
  }) {
    const { nome, email, senha, documento, telefone, endereco } = input;

    // 1) Cria usuário no Cognito
    const signUpResult = await cognito.send(
      new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: senha,
        SecretHash: this.calculateSecretHash(email),
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: nome },
        ],
      })
    );

    const sub = signUpResult.UserSub;
    if (!sub) {
      throw new Error("Falha ao obter sub do Cognito no signUp");
    }

    // 2) (Opcional, mas útil no desafio) confirmar o usuário automaticamente
    await cognito.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      })
    );

    // 3) Criar Cliente no Postgres vinculado ao sub
    const cliente = await prisma.cliente.create({
      data: {
        cognitoSub: sub,
        nome,
        email,
        documento,
        telefone,
        endereco,
      },
    });

    return cliente;
  }

  /**
   * Login: API recebe email + senha,
   * chama o Cognito pra autenticar, e devolve os tokens.
   */
  async login(input: { email: string; senha: string }) {
    const { email, senha } = input;

    const result = await cognito.send(
      new AdminInitiateAuthCommand({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
        AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: email,
          PASSWORD: senha,
          SECRET_HASH: this.calculateSecretHash(email),
        },
      })
    );

    if (!result.AuthenticationResult) {
      throw new Error("Falha na autenticação");
    }

    return {
      accessToken: result.AuthenticationResult.AccessToken,
      idToken: result.AuthenticationResult.IdToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      expiresIn: result.AuthenticationResult.ExpiresIn,
      tokenType: result.AuthenticationResult.TokenType,
    };
  }
}
