import { createServer, IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

let users: User[] = [
    {
        "id": "31ce49f8-f900-4896-a0b1-96b8957f81aa",
        "username": "Mike Doe",
        "age": 20,
        "hobbies": [
            "fishing",
            "gaming"
        ]
    }
];

const sendResponse = (res: ServerResponse, statusCode: number, data: any) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const parseBody = async (req: IncomingMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
  
      req.on('end', () => {
        if (!body) {
          resolve({});
        } else {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            resolve({})
          }
        }
      });
  
      req.on('error', (err) => {
        reject(err);
      });
    });
  };
  
  
  

const getUsers = (res: ServerResponse) => {
  sendResponse(res, 200, users);
};

const getUserById = (res: ServerResponse, userId: string) => {
  if (!isUuid(userId)) {
    return sendResponse(res, 400, { message: 'Invalid userId format' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return sendResponse(res, 404, { message: `User with id ${userId} not found` });
  }

  sendResponse(res, 200, user);
};

const createUser = async (req: IncomingMessage, res: ServerResponse) => {
  const { username, age, hobbies } = await parseBody(req);

  if (!username || !age || !Array.isArray(hobbies)) {
    return sendResponse(res, 400, { message: 'Missing required fields' });
  }

  const newUser: User = { id: uuidv4(), username, age, hobbies };
  users.push(newUser);
  sendResponse(res, 201, newUser);
};

const updateUser = async (req: IncomingMessage, res: ServerResponse, userId: string) => {
  if (!isUuid(userId)) {
    return sendResponse(res, 400, { message: 'Invalid userId format' });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return sendResponse(res, 404, { message: `User with id ${userId} not found` });
  }

  const { username, age, hobbies } = await parseBody(req);
  if (!username || !age || !Array.isArray(hobbies)) {
    return sendResponse(res, 400, { message: 'Missing required fields' });
  }

  users[userIndex] = { id: userId, username, age, hobbies };
  sendResponse(res, 200, users[userIndex]);
};

const deleteUser = (res: ServerResponse, userId: string) => {
  if (!isUuid(userId)) {
    return sendResponse(res, 400, { message: 'Invalid userId format' });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return sendResponse(res, 404, { message: `User with id ${userId} not found` });
  }

  users.splice(userIndex, 1);
  sendResponse(res, 204, null);
};

const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
  const [_, basePath, userId] = req.url?.split('/') || [];
  
  try {
    if (req.method === 'GET' && basePath === 'users' && !userId) {
      return getUsers(res);
    }

    if (req.method === 'GET' && basePath === 'users' && userId) {
      return getUserById(res, userId);
    }

    if (req.method === 'POST' && basePath === 'users') {
      return createUser(req, res);
    }

    if (req.method === 'PUT' && basePath === 'users' && userId) {
      return updateUser(req, res, userId);
    }

    if (req.method === 'DELETE' && basePath === 'users' && userId) {
      return deleteUser(res, userId);
    }

    sendResponse(res, 404, { message: 'Resource not found' });
  } catch (error) {
    sendResponse(res, 500, { message: 'Internal Server Error' });
  }
};

const PORT = process.env.PORT || 3000;
const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
