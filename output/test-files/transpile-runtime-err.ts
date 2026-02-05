interface User {
  name: string;
  age: number;
}

function getUser(id: number): User | null {
  if (id === 1) {
    return { name: "Alice", age: 30 };
  }
  return null;
}

function printUserName(user: User): void {
  console.log(`User name: ${user.name}`);
}

const user = getUser(2);
printUserName(user as User);

const data = JSON.parse("{ invalid json }");
console.log(data);
