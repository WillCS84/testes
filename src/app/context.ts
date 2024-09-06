import { createContext } from "react";
import { ListContextValue } from "./type";

export const ListContext = createContext<ListContextValue | null>(null);
