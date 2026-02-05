declare interface User {
  id: number;
  name: string;
  email: string;
}

declare function getUser(id: number): User;
declare function createUser(name: string, email: string): User;
