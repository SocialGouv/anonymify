import * as React from "react";
import { MouseEventHandler } from "react";

export const Button = ({ onClick }: { onClick: MouseEventHandler }) => {
  return <button onClick={onClick}>Boop</button>;
};
