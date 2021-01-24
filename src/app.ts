import express, { Express } from "express";

import * as middleware from "./middleware";
import { makeShutdownActions, ShutdownAction } from "./shutdownActions";
import { sanitizeEnv } from "./utils";

export function getShutdownActions(app: Express): ShutdownAction[] {
  return app.get("shutdownActions");
}

export async function makeApp(): Promise<Express> {
  sanitizeEnv();

  const isTest = process.env.NODE_ENV === "test";
  const isDev = process.env.NODE_ENV === "development";

  const shutdownActions = makeShutdownActions();

  if (isDev) {
    shutdownActions.push(() => {
      require("inspector").close();
    });
  }

  /*
   * Our Express server
   */
  const app = express();

  /*
   * In production, we may need to enable the 'trust proxy' setting so that the
   * server knows it's running in SSL mode, and so the logs can log the true
   * IP address of the client rather than the IP address of our proxy.
   */
  if (process.env.TRUST_PROXY) {
    /*
      We recommend you set TRUST_PROXY to the following:
        loopback,linklocal,uniquelocal
      followed by any other IPs you need to trust. For example for CloudFlare
      you can get the list of IPs from https://www.cloudflare.com/ips-v4; we
      have a script that does this for you (`yarn server cloudflare:import`)
      and a special `TRUST_PROXY=cloudflare` setting you can use to use them.
    */
    app.set(
      "trust proxy",
      process.env.TRUST_PROXY === "1"
        ? true
        : process.env.TRUST_PROXY.split(",")
    );
  }

  /*
   * For a clean nodemon shutdown, we need to close all our sockets otherwise
   * we might not come up cleanly again (inside nodemon).
   */
  app.set("shutdownActions", shutdownActions);

  /*
   * Middleware is installed from the /server/middleware directory. These
   * helpers may augment the express app with new settings and/or install
   * express middleware. These helpers may be asynchronous, but they should
   * operate very rapidly to enable quick as possible server startup.
   */
  await middleware.installDatabasePools(app);
  await middleware.installHelmet(app);
  await middleware.installLogging(app);
  await middleware.installPostGraphile(app);

  /*
   * Error handling middleware
   */
  await middleware.installErrorHandler(app);

  return app;
}
