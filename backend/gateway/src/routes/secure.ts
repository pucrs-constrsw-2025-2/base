import { Router, Request, Response } from 'express';
import Keycloak from 'keycloak-connect';

const router = Router();

export default (keycloak: Keycloak.Keycloak) => {
  router.get('/', keycloak.protect(), (_req: Request, res: Response) => {
    res.send('Rota protegida pelo Keycloak');
  });
  return router;
};
