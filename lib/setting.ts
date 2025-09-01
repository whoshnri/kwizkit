import { Prisma } from "@prisma/client";

export interface Settings extends Prisma.JsonObject {
  general: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };
  security: {
    enableTabSwitching: boolean;
    disableCopyPaste: boolean;
  };
  users: {
    usersAdded: boolean;
  };
  testTime: number;
}
