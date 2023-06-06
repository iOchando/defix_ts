import { Request, Response, NextFunction } from "express";

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.headers.authorization);
    if (!req.headers.authorization) {
      return res.status(404).send();
    }
    const token = req.headers.authorization.split(" ").pop();
    if (token === process.env.KEY_DJANGO) {
      next();
    } else {
      return res.status(404).send();
    }
  } catch (e) {
    return res.status(404).send();
  }
};

export = checkAuth;
