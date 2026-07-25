export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: "L" | "P";
  birthDate: string;

  classId: string;

  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "TRANSFERRED";
}