import { createContext } from "react";
import { ListContextValue } from "../Lib/type";

export const ListContext = createContext<ListContextValue | null>(null);
