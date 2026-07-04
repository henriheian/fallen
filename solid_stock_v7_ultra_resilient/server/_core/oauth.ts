import { COOKIE_NAME, ONE_YEAR_MS } from "#shared/const";
import type { Express, Request, Response, NextFunction } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Auto dev login middleware if AUTO_DEV_LOGIN is enabled
  if (ENV.autoDevLogin) {
    app.use(async (req: Request, res: Response, next: NextFunction) => {
      // Check if user already has a session
      const cookies = (req.headers.cookie || "").split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      if (cookies[COOKIE_NAME]) {
        // User already logged in, continue normally
        return next();
      }

      // Auto-login as dev for all API requests or the root path
      if (req.path === "/" || req.path.startsWith("/api/")) {
        try {
          const devUser = {
            openId: "dev-user-id",
            name: "Developer",
            email: "dev@example.com",
            loginMethod: "dev",
          };

          // Attempt to persist but don't block if DB fails (handled by db.ts resilience)
          await db.upsertUser({
            openId: devUser.openId,
            name: devUser.name,
            email: devUser.email,
            loginMethod: devUser.loginMethod,
            lastSignedIn: new Date(),
          });

          const sessionToken = await sdk.createSessionToken(devUser.openId, {
            name: devUser.name,
            expiresInMs: ONE_YEAR_MS,
          });

          const cookieOptions = getSessionCookieOptions(req);
          res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          
          // Manually add to req.headers.cookie so subsequent middlewares in the same request see it
          const newCookie = `${COOKIE_NAME}=${sessionToken}`;
          req.headers.cookie = req.headers.cookie ? `${req.headers.cookie}; ${newCookie}` : newCookie;

          console.log(`[Auth] Auto dev login injected for ${req.path}`);
        } catch (error) {
          console.error("[Auth] Auto dev login failed", error);
        }
      }

      return next();
    });
  }

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Dev login route (kept for backward compatibility)
  app.get("/api/auth/dev-login", async (req: Request, res: Response) => {
    try {
      const devUser = {
        openId: "dev-user-id",
        name: "Developer",
        email: "dev@example.com",
        loginMethod: "dev",
      };

      await db.upsertUser({
        openId: devUser.openId,
        name: devUser.name,
        email: devUser.email,
        loginMethod: devUser.loginMethod,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(devUser.openId, {
        name: devUser.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[Auth] Dev login failed", error);
      res.status(500).json({ error: "Dev login failed" });
    }
  });
}
