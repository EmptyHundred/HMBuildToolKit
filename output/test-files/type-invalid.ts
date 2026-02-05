// This file should fail type checking
const user: User = {
  id: "wrong-type",  // Error: should be number
  name: "John",
  email: "john@example.com"
};

const fetched: User = getUser("not-a-number");  // Error: argument should be number

console.log(user, fetched);
