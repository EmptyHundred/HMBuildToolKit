var message = "Hello";  // should use const/let

const unused = 42;  // unused variable

function greet(name: any) {  // any type warning
  console.log(message + name);  // console.log warning
  if (name == "admin") {  // should use ===
    eval("alert('admin')");  // eval is not allowed
  }
}

greet("World");
