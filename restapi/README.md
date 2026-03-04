# Week 5 - Backend Fundamentals & REST APIs Assignment


## 🛠️ Endpoint Specifications

### 1. List Users (Collection)
**URL:** `GET /users`
**Purpose:** Retrieves multiple users with support for pagination, sorting, and filtering.

| Parameter  | Description |
| :--- |  :--- |
| `page` |  The current page number (Default: 1)|
| `limit` | Records per page (Default: 10) |
| `sortBy` |  Field name to sort results (e.g., `firstName`, `email`) |
| `order` |  Sorting direction: `ASC` (Ascending) or `DESC` (Descending) |
| `filterField` | The specific user field to filter by |
| `filterValue` | The search value to match against the filter field |

**Success Response (200 OK):**

>
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Aarav",
      "lastName": "Sharma",
      "email": "aarav.s@example.com",
      "phoneNumber": "+919876543201",
      "password": "vK9!2pL#qR",
      "createdAt": "2026-03-04T09:07:30.747Z"
    },
    {
      "id": 2,
      "firstName": "Vihaan",
      "lastName": "Verma",
      "email": "vihaan.v@example.com",
      "phoneNumber": "+919876543202",
      "password": "zM4*8xN@tB",
      "createdAt": "2026-03-04T09:07:45.196Z"
    },
    {
      "id": 3,
      "firstName": "Aditya",
      "lastName": "Gupta",
      "email": "aditya.g@example.com",
      "phoneNumber": "+919876543203",
      "password": "hJ7$1kF^uY",
      "createdAt": "2026-03-04T09:08:42.136Z"
    },
    {
      "id": 4,
      "firstName": "Arjun",
      "lastName": "Malhotra",
      "email": "arjun.m@example.com",
      "phoneNumber": "+919876543204",
      "password": "dW2&5eS*oP",
      "createdAt": "2026-03-04T09:08:51.397Z"
    },
    {
      "id": 5,
      "firstName": "Sai",
      "lastName": "Reddy",
      "email": "sai.r@example.com",
      "phoneNumber": "+919876543205",
      "password": "qA9(0zX!mN",
      "createdAt": "2026-03-04T09:08:58.969Z"
    },
    {
      "id": 6,
      "firstName": "Ishaan",
      "lastName": "Nair",
      "email": "ishaan.n@example.com",
      "phoneNumber": "+919876543206",
      "password": "gK3#6vL@bR",
      "createdAt": "2026-03-04T09:11:02.893Z"
    },
    {
      "id": 7,
      "firstName": "Krishna",
      "lastName": "Iyer",
      "email": "krishna.i@example.com",
      "phoneNumber": "+919876543207",
      "password": "xP5%8yT*nQ",
      "createdAt": "2026-03-04T09:11:10.856Z"
    },
    {
      "id": 8,
      "firstName": "Rohan",
      "lastName": "Deshmukh",
      "email": "rohan.d@example.com",
      "phoneNumber": "+919876543208",
      "password": "uH1@4kM^jI",
      "createdAt": "2026-03-04T09:11:21.730Z"
    },
    {
      "id": 9,
      "firstName": "Kabir",
      "lastName": "Singh",
      "email": "kabir.s@example.com",
      "phoneNumber": "+919876543209",
      "password": "sD9&2fG#lK",
      "createdAt": "2026-03-04T09:11:30.093Z"
    },
    {
      "id": 10,
      "firstName": "Aryan",
      "lastName": "Patel",
      "email": "aryan.p@example.com",
      "phoneNumber": "+919876543210",
      "password": "mN4!7bV@qW",
      "createdAt": "2026-03-04T09:11:55.587Z"
    }
  ],
  "pagination": {
    "total_records": 16,
    "current_page": 1,
    "total_pages": 2,
    "next_page": 2,
    "prev_page": null
  }
}
```
### GET /users?page=2&limit=5

output:
<img width="219" height="670" alt="image" src="https://github.com/user-attachments/assets/94b60386-4e2e-4b05-86e8-504697bf2904" />


### GET /users?sortBy=firstName&order=ASC&page=1&limit=5
<img width="239" height="691" alt="image" src="https://github.com/user-attachments/assets/68bd356e-865f-48b9-942c-0adbec0b58d1" />

---

### 2. Create New User
**URL:** `POST /users`
**Purpose:** Registers a new user account with strict data validation
**Request Body:** Requires `firstName`, `lastName`, `email`, `phoneNumber`, and `password`.

**Success Response (201 Created):**
<img width="1100" height="407" alt="image" src="https://github.com/user-attachments/assets/fde94af7-11c1-4d3a-b396-1b68be0f7dfb" />


---

### 3. Retrieve Specific User
**URL:** `GET /users/:id`
**Purpose:** Retrieves detailed information for a specific user based on their ID.


**Success Response (200 OK):**
<img width="1132" height="172" alt="image" src="https://github.com/user-attachments/assets/104799f6-bcd1-4148-b74d-343eff4e274a" />


---

### 4. Partial User Update
**URL:** `PATCH /users/:id`
**Purpose:** Modifies specific fields of an existing user resource using PATCH for partial updates

**Success Response (200 OK):**

<img width="1153" height="371" alt="image" src="https://github.com/user-attachments/assets/adaf9421-61ef-498b-b856-d9b30f6dce2e" />

---

### 5. Remove User
**URL:** `DELETE /users/:id`
**Purpose:** Permanently deletes a user record from the system

**Success Response (204 No Content):**
<img width="1230" height="258" alt="image" src="https://github.com/user-attachments/assets/57853986-6aec-41c7-b0df-a1431ceb7b93" />


### Entering duplicate data(email):
 <img width="1191" height="296" alt="image" src="https://github.com/user-attachments/assets/b914a770-0c1a-4540-8bdd-36a408dd7206" />



### Authorization error.

**without sending auth key:(401)**
<img width="1077" height="271" alt="image" src="https://github.com/user-attachments/assets/47607307-0483-4d35-b36f-a573b0e0d4f1" />

**with auth key**  and **proper role (admin)**
<img width="1077" height="271" alt="image" src="https://github.com/user-attachments/assets/086de1f9-5597-4b2b-8382-df60dad04148" />

### forbidden error (403)**
**without role**
<img width="1230" height="258" alt="image" src="https://github.com/user-attachments/assets/48f51429-5513-4e8e-bd9f-4c2ff171ea32" />



 



---

##  5xx Simulations
A key requirement of this assignment is handling server-side failures gracefully. The following endpoints simulate common **5xx Server Errors**

**500 Internal Server Error (`/users/isr`)**: Simulates an unexpected server failure.
<img width="1191" height="296" alt="image" src="https://github.com/user-attachments/assets/15789f29-aa5c-4f47-936f-8ada633f1e6c" />

**504 Gateway Timeout (`/users/timeout`)**: Simulates an upstream server failing to respond within a defined time threshold using promise.

<img width="1147" height="268" alt="image" src="https://github.com/user-attachments/assets/b849a31d-0da3-4d5e-bf15-b18612e3979a" />

**502 Bad Gateway (`/users/badgateway`)**: Simulates a gateway receiving an invalid response from the upstream server
<img width="1191" height="296" alt="image" src="https://github.com/user-attachments/assets/bc22ac92-d360-4f45-b6b0-aecd47966d64" />
