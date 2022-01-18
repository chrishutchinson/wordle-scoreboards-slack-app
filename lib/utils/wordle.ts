import { differenceInDays } from "date-fns";
import { config } from "../config/config";

export const getCurrentPuzzleNumber = () => {
  const today = new Date();

  const { baseDate, baseIndex } = config.wordle;

  const diffDays = differenceInDays(today, baseDate);

  return baseIndex + diffDays;
};
