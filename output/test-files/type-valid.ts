// This file should pass type checking
const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

const fetched: User = getUser(123);
const created: User = createUser("Jane", "jane@example.com");

console.log(user, fetched, created);
