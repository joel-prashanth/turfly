# Turfly Authentication & Authorization Module

## Overview

The Authentication and Authorization module is responsible for:

* User Registration
* User Login
* Password Security
* JWT Generation
* Cookie-Based Authentication
* Route Protection
* Role-Based Access Control (RBAC)

Current supported roles:

* OWNER
* PLAYER

Future support:

* ADMIN

---

# Architecture

The backend follows a layered architecture:

Request
↓
Route
↓
Controller
↓
Service
↓
Prisma
↓
Database

## Responsibilities

### Route Layer

Responsible for:

* URL mapping
* Middleware chaining

Does NOT contain:

* Business logic
* Database operations

Example:

```js
router.post("/register", registerController);
```

---

### Controller Layer

Responsible for:

* Reading request data
* Calling services
* Setting HTTP status codes
* Returning JSON responses
* Managing cookies

Does NOT contain:

* Business logic
* Database operations

---

### Service Layer

Responsible for:

* Validation
* Authentication
* Authorization decisions
* Password hashing
* JWT generation
* Business rules

Does NOT contain:

* HTTP concerns

---

### Prisma Layer

Responsible for:

* Database communication

Examples:

```js
findUnique()
create()
update()
delete()
```

---

# Registration Flow

Endpoint:

POST /api/v1/auth/register

Request:

```json
{
  "name": "Joel",
  "email": "joel@gmail.com",
  "password": "Password123",
  "role": "OWNER"
}
```

Flow:

Request
↓
Validate Required Fields
↓
Validate Role
↓
Check Duplicate Email
↓
Hash Password
↓
Create User
↓
Return Safe User Response

---

## Role Validation

Allowed:

* OWNER
* PLAYER

Blocked:

* ADMIN
* owner
* player

---

## Duplicate Email Protection

Application-level validation:

```js
prisma.user.findUnique({
  where: {
    email,
  },
});
```

Database-level validation:

```prisma
email String @unique
```

---

## Password Hashing

Passwords are never stored directly.

Implementation:

```js
bcrypt.hash(password, 10);
```

Stored:

```text
passwordHash
```

Not stored:

```text
password
```

---

# Login Flow

Endpoint:

POST /api/v1/auth/login

Request:

```json
{
  "email": "joel@gmail.com",
  "password": "Password123"
}
```

Flow:

Request
↓
Find User
↓
Compare Password
↓
Generate JWT
↓
Set Cookie
↓
Return Safe User

---

## Password Verification

```js
bcrypt.compare(
  password,
  user.passwordHash
);
```

---

# JWT Design

Payload:

```json
{
  "userId": "uuid",
  "role": "OWNER"
}
```

Automatically added:

```json
{
  "iat": "...",
  "exp": "..."
}
```

JWT Expiration:

```text
7 days
```

---

## Security Rules

Allowed:

* userId
* role

Never store:

* password
* passwordHash
* phone

JWTs are:

* Signed
* Not encrypted

---

# Cookie Authentication

Token is stored inside an HTTP-only cookie.

Implementation:

```js
res.cookie("accessToken", token, {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

Benefits:

* JavaScript cannot access token
* Reduced XSS exposure
* Cleaner API responses

---

# Authentication Middleware

File:

```text
src/middleware/authenticate.js
```

Purpose:

Verify user identity.

Flow:

Request
↓
Read Cookie
↓
Verify JWT
↓
Populate req.user
↓
next()

---

## req.user

```js
req.user = {
  userId: decoded.userId,
  role: decoded.role,
};
```

---

# Authorization Middleware

File:

```text
src/middleware/authorize.js
```

Purpose:

Verify user permissions.

Usage:

```js
authorize("OWNER")
```

or

```js
authorize("OWNER", "ADMIN")
```

Flow:

Request
↓
Read req.user.role
↓
Compare Allowed Roles
↓
Allow / Deny

Implementation Logic:

```js
roles.includes(req.user.role)
```

---

# HTTP Status Codes

401 Unauthorized

Meaning:

User identity cannot be verified.

Examples:

* Missing token
* Invalid token
* Expired token

---

403 Forbidden

Meaning:

User identity is known but access is denied.

Example:

PLAYER attempting OWNER-only action.

---

# Current Status

Completed:

* Register
* Login
* Password Hashing
* JWT Generation
* Cookie Authentication
* Authentication Middleware
* Authorization Middleware
* Protected Route Testing

Remaining:

* Logout
* Password Strength Validation

---

# Learning Outcomes

Concepts learned:

* Layered Backend Architecture
* JWT Authentication
* HTTP-only Cookies
* Middleware Design
* Middleware Factories
* Closures
* Role-Based Access Control (RBAC)
* Prisma ORM
* Route Protection
* Secure Password Storage
