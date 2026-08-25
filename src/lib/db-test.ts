import { db } from "@/prisma/db";

export async function getUsers() {
  return db.orm.public.User.all();
}