// server/src/db/query.types.ts
export const PATH_LIST = ["get_list", "create_item"] as const;
export type PathName = typeof PATH_LIST[number];

export type Item = {
  id: number;
  name: string;
  description: string;
};
