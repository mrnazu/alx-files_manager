# 0x04. Files Manager

A back-end project utilizing technologies such as `JavaScript`, `ES6`, `NoSQL`, `MongoDB`, `Redis`, `NodeJS`, `ExpressJS` and `Kue`.

## Project Details

- **By:** Guillaume, CTO at Holberton School
- **Weight:** 1
- **Team Members:** Samuel Amsalu and Tebogo Legoabe
- **Start Date:** Feb 7, 2024 at 7:00 PM 
- **End Date:** Feb 14, 2024 at 7:00 PM 
- **Checker Release:** Feb 9, 2024 at 1:00 PM 

### Description

This project is a summary of this back-end trimester focusing on authentication, NodeJS, MongoDB, Redis, pagination and background processing. The objective is to build a simple platform to upload and view files with features including user authentication via token and file management capabilities.

### Features

- User authentication via a token
- List all files
- Upload a new file
- Change permission of a file
- View a file
- Generate thumbnails for images

### Resources

Read or watch:

- [Node JS getting started](#)
- [Process API doc](#)
- [Express getting started](#)
- [Mocha documentation](#)
- [Nodemon documentation](#)

### Learning Objectives

At the end of this project you should be able to explain:

* How to create an API with Express.
* How to authenticate a user.
* How to store data in MongoDB.
* How to store temporary data in Redis.
* How to setup and use a background worker.

### Requirements 

* Allowed editors: vi,vim ,emacs ,Visual Studio Code.
* All files will be interpreted/compiled on Ubuntu18.04 LTS using node(version12.x.x).
* Your code should use the js extension.

### Tasks

#### 0. Redis utils

Inside the folder `utils`, create a file `redis.js` that contains the class RedisClient.

RedisClient should have:

- the constructor that creates a client to Redis:
  - any error of the redis client must be displayed in the console (you should use on('error') of the redis client)
- a function `isAlive` that returns true when the connection to Redis is a success otherwise, false
- an asynchronous function get that takes a string key as argument and returns the Redis value stored for this key
- an asynchronous function set that takes a string key, a value and a duration in second as arguments to store it in Redis (with an expiration set by the duration argument)
- an asynchronous function del that takes a string key as argument and remove the value in Redis for this key

After the class definition, create and export an instance of RedisClient called redisClient.

```bash
bob@dylan:~$ cat main.js
import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));

    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));
    }, 1000*10)
})();

bob@dylan:~$ npm run dev main.js
true
null
12
null
bob@dylan:~$ 
```

Repo:

- GitHub repository: `alx-files_manager`
- File: `utils/redis.js`

#### 1. MongoDB utils

Inside the folder utils, create a file db.js that contains the class DBClient.

DBClient should have:

- the constructor that creates a client to MongoDB:
  - host: from the environment variable `DB_HOST` or default: localhost
  - port: from the environment variable `DB_PORT` or default: `27017`
  - database: from the environment variable `DB_DATABASE` or default: `files_manager`
- a function isAlive that returns true when the connection to MongoDB is a success otherwise, false
- an asynchronous function nbUsers that returns the number of documents in the collection users
- an asynchronous function nbFiles that returns the number of documents in the collection files

After the class definition, create and export an instance of DBClient called dbClient.

```bash
bob@dylan:~$ cat main.js
import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject()
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    })
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();

bob@dylan:~$ npm run dev main.js
false
true
4
30
bob@dylan:~$ 
```

Repo:

- GitHub repository: `alx-files_manager`
- File: `utils/db.js`

#### 2. First API

Inside `server.js`, create the Express server:

- it should listen on the port set by the environment variable PORT or by default 5000
- it should load all routes from the file routes/index.js

Inside the folder routes, create a file index.js that contains all endpoints of our API:

- GET `/status` => `AppController.getStatus`
- GET `/stats` => `AppController.getStats`

Inside the folder controllers, create a file AppController.js that contains the definition of the 2 endpoints:

- GET `/status` should return if Redis is alive and if the DB is alive too by using the 2 utils created previously: `{ "redis": true, "db": true }` with a status code `200`
- GET `/stats` should return the number of users and files in DB: `{ "users": 12, "files": 1231 }` with a status code `200`

Repo:

- GitHub repository: `alx-files_manager`
- File: `server.js`, `routes/index.js`, `controllers/AppController.js`

#### 3. Create a new user

Now that we have a simple API, it’s time to add users to our database.

In the file routes/index.js, add a new endpoint:

- POST /users => UsersController.postNew

Inside controllers, add a file UsersController.js that contains the new endpoint:

POST /users should create a new user in DB:

- To create a user, you must specify an email and a password
- If the email is missing, return an error Missing email with a status code 400
- If the password is missing, return an error Missing password with a status code 400
- If the email already exists in DB, return an error Already exist with a status code 400
- The password must be stored after being hashed in SHA1
- The endpoint is returning the new user with only the email and the id (auto generated by MongoDB) with a status code 201
- The new user must be saved in the collection users:
  - email: same as the value received
  - password: SHA1 value of the value received

```bash
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"id":"5f1e7d35c7ba06511e683b21","email":"bob@dylan.com"}
bob@dylan:~$ 
bob@dylan:~$ echo 'db.users.find()' | mongo files_manager
{ "_id" : ObjectId("5f1e7d35c7ba06511e683b21"), "email" : "bob@dylan.com", "password" : "89cad29e3ebc1035b29b1478a8e70854f25fa2b2" }
bob@dylan:~$ 
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"error":"Already exist"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com" }' ; echo ""
{"error":"Missing password"}
bob@dylan:~$ 
```

#### 4. Authenticate a user

In the file routes/index.js, add 3 new endpoints:

- GET `/connect` => `AuthController.getConnect`
- GET `/disconnect` => `AuthController.getDisconnect`
- GET `/users/me` => `UserController.getMe`

Inside `controllers`, add a file `AuthController.js` that contains new endpoints:

GET `/connect` should sign-in the user by generating a new authentication token:

- By using the header Authorization and the technique of the Basic auth (Base64 of the `<email>:<password>`), find the user associate to this email and with this password (reminder: we are storing the SHA1 of the password)
- If no user has been found, return an error Unauthorized with a status code 401
- Otherwise:
  - Generate a random string (using uuidv4) as token
  - Create a key: auth_`<token>`
  - Use this key for storing in Redis (by using the redisClient create previously) the user ID for 24 hours
  - Return this token: `{ "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }` with a status code 200

Now, we have a way to identify a user, create a token (= avoid to store the password on any front-end) and use this token for 24h to access to the API!

Every authenticated endpoints of our API will look at this token inside the header X-Token.

GET `/disconnect` should sign-out the user based on the token:

- Retrieve the user based on the token:
  - If not found, return an error Unauthorized with a status code 401
  - Otherwise, delete the token in Redis and return nothing with a status code 204

Inside the file controllers/UsersController.js add a new endpoint:

GET /users/me should retrieve the user base on the token used:

- Retrieve the user based on the token:
  - If not found, return an error Unauthorized with a status code 401
  - Otherwise, return the user object (email and id only)

```bash
bob@dylan:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"031bffac-3edc-4e51-aaae-1c121317da8a"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"id":"5f1e7cda04a394508232559d","email":"bob@dylan.com"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/disconnect -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""

bob@dylan:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"error":"Unauthorized"}
bob@dylan:~$ 
```

Repo:

- GitHub repository: `alx-files_manager`
- File: `utils/`, `routes/index.js`, `controllers/UsersController.js`, `controllers/AuthController.js`

...
...
..
..
..
...