import { getClassCount } from "./class.repository";


export async function getDashboardClassCount() {

  return await getClassCount();

}