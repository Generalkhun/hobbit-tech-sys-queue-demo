export type DirectoryPageKey =
  | "vehicles"
  | "provinces"
  | "vehicle-types";

export interface DirectoryRecord {
  id: string;
  name: string;
  detail: string;
  status: "active" | "pending";
}

export interface DirectoryDefinition {
  page: DirectoryPageKey;
  title: string;
  description: string;
  noun: string;
  icon: "users" | "warehouse" | "truck" | "map" | "weight";
  columns: [string, string];
  records: DirectoryRecord[];
}
