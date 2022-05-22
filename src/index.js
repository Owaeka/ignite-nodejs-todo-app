const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).send({error: 'Mensagem do erro'});
  }

  request.user = user;

  next();
}

function checksExistsUsername(request, response, next) {
  const { username } = request.body;
  const user = users.find(user => user.username === username);

  if(user) {
    return response.status(400).send({error: 'Username já utilizado.'});
  }

  next();
}

app.post('/users', checksExistsUsername, (request, response) => {
  const {name, username} = request.body;
  
  const newUser = { 
    id: uuidv4(),
    name: name, 
    username: username, 
    todos: []
  };

  users.push(newUser);

  response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = { 
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  user.todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;
  const {title, deadline } = request.body;

  const updatingTodo = user.todos.find(todo => todo.id === id);

  if(!updatingTodo) {
    return response.status(404).send({error: 'Mensagem do erro'});
  }

  updatingTodo.title = title;
  updatingTodo.deadline = deadline;

  return response.status(200).send(updatingTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const updatingTodo = user.todos.find(todo => todo.id === id);

  if(!updatingTodo) {
    return response.status(404).send({error: 'Todo nao encontrado'});
  }

  updatingTodo.done = true;

  return response.status(200).send(updatingTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const deletingTodo = user.todos.find(todo => todo.id === id);

  if(!deletingTodo) {
    return response.status(404).send({error: 'Mensagem do erro'});
  }

  user.todos.splice(deletingTodo, 1);

  return response.status(204).send();
});

module.exports = app;