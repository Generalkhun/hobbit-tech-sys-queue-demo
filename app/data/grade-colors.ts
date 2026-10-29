export interface GradeColor {
  bar: string;
  soft: string;
  text: string;
}

const palette: GradeColor[] = [
  { bar: "bg-sys-500", soft: "bg-sys-50", text: "text-sys-800" },
  { bar: "bg-amber-400", soft: "bg-amber-50", text: "text-amber-800" },
  { bar: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-800" },
  { bar: "bg-violet-500", soft: "bg-violet-50", text: "text-violet-800" },
  { bar: "bg-rose-400", soft: "bg-rose-50", text: "text-rose-800" },
  { bar: "bg-sky-500", soft: "bg-sky-50", text: "text-sky-800" },
];

export function getGradeColor(grades: string[], grade: string): GradeColor {
  const index = Math.max(0, grades.indexOf(grade));
  return palette[index % palette.length];
}
