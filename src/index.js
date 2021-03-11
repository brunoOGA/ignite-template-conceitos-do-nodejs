const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const foundUser = users.find(item => item.username === username)

  if(!foundUser) {
    return response.status(400).json({error: "Username incorreto!"})
  }

  request.user = foundUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;


  const foundUser = users.some(item => item.username === username);

  if(foundUser) {
    return response.status(400).json({error: "Username já existente!"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;
  
  const foundTodo = user.todos.find(item => item.id === id);

  if(!foundTodo) {
    return response.status(404).send({error: "Id inválido"});
  }

  const index = user.todos.indexOf(foundTodo)

  user.todos[index].title = title; 
  user.todos[index].deadline = new Date(deadline); 

  return response.status(200).json(user.todos[index]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundTodo = user.todos.find(item => item.id === id);

  if(!foundTodo) {
    return response.status(404).send({error: "Id inválido"});
  }

  const index = user.todos.indexOf(foundTodo);

  user.todos[index].done = true; 

  return response.status(200).json(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundTodo = user.todos.find(item => item.id === id);

  if(!foundTodo) {
    return response.status(404).send({error: "Id inválido"});
  }

  user.todos.splice(foundTodo, 1);

  return response.status(204).send();
});

module.exports = app;