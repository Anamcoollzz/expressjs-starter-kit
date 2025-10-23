import { Op, WhereOptions, Order } from "sequelize";

interface Query {
  q?: string;
  page?: string;
  limit?: string;
  sort?: string;
  order?: "asc" | "desc" | string;
}

export function buildListParams(query: Query, searchable: string[]) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "10", 10), 1), 100);
  const offset = (page - 1) * limit;

  let where: WhereOptions = {};
  if (query.q) {
    const like = `%${query.q}%`;
    where = {
      [Op.or]: searchable.map((col) => ({ [col]: { [Op.like]: like } }))
    };
  }

  let order: Order = [];
  if (query.sort && searchable.includes(query.sort)) {
    order = [[query.sort, (query.order?.toUpperCase() === "DESC" ? "DESC" : "ASC") as any]];
  } else {
    order = [["createdAt", "DESC"]];
  }

  return { page, limit, offset, where, order };
}
