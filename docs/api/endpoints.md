# Maintenance REST API

## Endpoints for administrators

### Login
* `POST` [`/login`](./login/post.md) _Login an user_

### User
* `GET` [`/users`](./users/get.md) _Get all users_
* `GET` [`/users/:id`](./users/id/get.md) _Get a specific user_

### Customer
* `GET` [`/customer`](./customer/get.md) _Get all customers_
* `POST` [`/customer`](./customer/post.md) _Create a new customer_
* `GET` [`/customer/:id`](./customer/id/get.md) _Get a specific customer_
* `PUT` [`/customer/:id`](./customer/id/post.md) _Update a customer_
* `DELETE` [`/customer/:id`](./customer/id/delete.md) _Delete a customer_

### System
* `GET` [`/system`](./system/get.md) _Get all systems_
* `POST` [`/system`](./system/post.md) _Create a new system_
* `GET` [`/system/:id`](./system/id/get.md) _Get a system_
* `PUT` [`/system/:id`](./system/id/put.md) _Update a system_
* `DELETE` [`/system/:id`](./system/id/delete.md) _Delete a system_

### Maintenance
* `GET` [`/maintenance`](./maintenance/get.md) _Get all maintenances_
* `POST` [`/maintenance`](./maintenance/post.md) _Create a new maintenance_
* `GET` [`/maintenance/:id`](./maintenance/id/get.md) _Get a maintenance_
* `PUT` [`/maintenance/:id`](./maintenance/id/put.md) _Update a maintenance_
* `DELETE` [`/maintenance/:id`](./maintenance/id/delete.md) _Delete a maintenance_

## Endpoints for maintenancers
### Login
* `POST` [`/login`](./login/post.md) _Login an user_

### User
* `GET` [`/users/:id`](./users/id/get.md) _Get a specific user_

### Customer
* `GET` [`/customer/:id`](./customer/id/get.md) _Get a specific customer_

### System
* `GET` [`/system/:id`](./system/id/get.md) _Get a system_

### Maintenance
* `GET` [`/maintenance`](./maintenance/get.md) _Get all maintenances for the requesting user_
* `GET` [`/maintenance/:id`](./maintenance/id/get.md) _Get a maintenance_
* `PUT` [`/maintenance/:id`](./maintenance/id/put.md) _Update a maintenance_
