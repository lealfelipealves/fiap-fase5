import { env } from "@/app/config/env";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: env.COGNITO_USER_POOL_ID,
  tokenUse: "id",
  clientId: env.COGNITO_CLIENT_ID,
});
