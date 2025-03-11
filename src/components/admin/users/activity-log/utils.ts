
import { ActionType } from "./types";

export const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case 'create':
      return "default";
    case 'update':
      return "outline";
    case 'delete':
      return "destructive";
    case 'login':
      return "default";
    case 'logout':
      return "secondary";
    case 'approve':
      return "default";
    case 'reject':
      return "destructive";
    case 'verify':
      return "default";
    default:
      return "outline";
  }
};
