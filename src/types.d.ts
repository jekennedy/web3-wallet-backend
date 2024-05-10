declare global {
  namespace Express {
    interface User {
      userId?: string;
    }
  }
}

export {};
