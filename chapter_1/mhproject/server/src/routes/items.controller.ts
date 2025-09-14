import { Router } from "express";
import ItemsService from "../services/items.service.js";

export const itemsRouter = Router();
const service = ItemsService.getInstance();

itemsRouter.get("/get_list", (req, res) => service.getList(req, res));
itemsRouter.post("/create_item", (req, res) => service.createItem(req, res));
