import { AuthenticationException } from "../../error-handling/errors";
import { logger } from "../../utils/aws/logger";
import { getSha256Hash } from "../../utils/crypto";
import { generateJWT } from "../../utils/jwt";
import { userService } from "../user/user.service";
import { type AuthenticatedUser, type Credentials } from "./auth.model";
import { removePassword } from "./auth.utils";

async function authenticate(credentials: Credentials): Promise<AuthenticatedUser | null> {
  const { username, password } = credentials;

  const userWithSameUsername = await userService.findByUsername(username);
  if (!userWithSameUsername) {
    logger.warn("Cannot authenticate user because it is not found", { username });
    throw new AuthenticationException("The combination of username and password does not match any existing account.");
  }
  const passwordHash = getSha256Hash(password + userWithSameUsername.passwordAccount?.salt);
  if (passwordHash !== userWithSameUsername.passwordAccount?.passwordHash) {
    logger.warn("Cannot authenticate user because password is wrong", { username });
    throw new AuthenticationException("The combination of username and password does not match any existing account.");
  }

  logger.info("User authenticated", { username });
  return {
    user: removePassword(userWithSameUsername),
    token: generateJWT({ id: userWithSameUsername["_id"], type: userWithSameUsername.type }),
  };
}

export type AuthService = {
  authenticate(credentials: Credentials): Promise<AuthenticatedUser | null>;
};

const authService: AuthService = {
  authenticate,
};

export { authService };
