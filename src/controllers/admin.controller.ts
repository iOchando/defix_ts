import { Request, Response } from "express";
import { User } from "../entities/user.entity";

const getUsersDefix = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ select: ["defix_id", "id"] });

    res.send(users);
  } catch (error) {
    res.status(404).send();
  }
};

export { getUsersDefix };
