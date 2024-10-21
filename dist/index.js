"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let users = [
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
const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};
const parseBody = (req) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if (!body) {
                resolve({});
            }
            else {
                try {
                    resolve(JSON.parse(body));
                }
                catch (error) {
                    resolve({});
                }
            }
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
});
const getUsers = (res) => {
    sendResponse(res, 200, users);
};
const getUserById = (res, userId) => {
    if (!(0, uuid_1.validate)(userId)) {
        return sendResponse(res, 400, { message: 'Invalid userId format' });
    }
    const user = users.find(u => u.id === userId);
    if (!user) {
        return sendResponse(res, 404, { message: `User with id ${userId} not found` });
    }
    sendResponse(res, 200, user);
};
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, age, hobbies } = yield parseBody(req);
    if (!username || !age || !Array.isArray(hobbies)) {
        return sendResponse(res, 400, { message: 'Missing required fields' });
    }
    const newUser = { id: (0, uuid_1.v4)(), username, age, hobbies };
    users.push(newUser);
    sendResponse(res, 201, newUser);
});
const updateUser = (req, res, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, uuid_1.validate)(userId)) {
        return sendResponse(res, 400, { message: 'Invalid userId format' });
    }
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return sendResponse(res, 404, { message: `User with id ${userId} not found` });
    }
    const { username, age, hobbies } = yield parseBody(req);
    if (!username || !age || !Array.isArray(hobbies)) {
        return sendResponse(res, 400, { message: 'Missing required fields' });
    }
    users[userIndex] = { id: userId, username, age, hobbies };
    sendResponse(res, 200, users[userIndex]);
});
const deleteUser = (res, userId) => {
    if (!(0, uuid_1.validate)(userId)) {
        return sendResponse(res, 400, { message: 'Invalid userId format' });
    }
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return sendResponse(res, 404, { message: `User with id ${userId} not found` });
    }
    users.splice(userIndex, 1);
    sendResponse(res, 204, null);
};
const handleRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [_, basePath, userId] = ((_a = req.url) === null || _a === void 0 ? void 0 : _a.split('/')) || [];
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
    }
    catch (error) {
        sendResponse(res, 500, { message: 'Internal Server Error' });
    }
});
const PORT = process.env.PORT || 3000;
const server = (0, http_1.createServer)(handleRequest);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
