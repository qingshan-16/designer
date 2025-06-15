import { v4 as uuidv4 } from "uuid";

function getUUID(): string {
  return uuidv4();
}

export default getUUID;
