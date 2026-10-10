const { estNonVide, estEmailValide } = require('../utils/validators');

let users = [
  { id: 1, name: 'Aya', email: 'aya@example.com', role: 'author' },
  { id: 2, name: 'Admin', email: 'admin@example.com', role: 'admin' }
];

let nextUserId = 3;

const getAllUsers = (req, res) => {
  const { role } = req.query;
  const result = role
    ? users.filter(user => user.role === role)
    : users;

  res.status(200).json(result);
};

const getUserById = (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(item => item.id === id);

  if (!user) {
    return res.status(404).json({
      error: `User ${req.params.id} not found`
    });
  }

  res.status(200).json(user);
};

const createUser = (req, res) => {
  const { name, email, role } = req.body ?? {};

  if (!estNonVide(name)) {
    return res.status(400).json({
      error: 'Name is required and cannot be empty'
    });
  }

  if (!estEmailValide(email)) {
    return res.status(400).json({
      error: 'Email must be valid and contain @ and .'
    });
  }

  const newUser = {
    id: nextUserId,
    name: name.trim(),
    email: email.trim(),
    role: typeof role === 'string' && role.trim() ? role.trim() : 'user'
  };

  nextUserId += 1;
  users.push(newUser);

  res.status(201).json({
    message: 'User created',
    user: newUser
  });
};

const deleteUser = (req, res) => {
  const id = Number(req.params.id);
  const userExists = users.some(user => user.id === id);

  if (!userExists) {
    return res.status(404).json({
      error: `Unable to delete: user ${req.params.id} not found`
    });
  }

  users = users.filter(user => user.id !== id);

  res.status(200).json({
    message: `User ${req.params.id} deleted successfully`
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser
};
