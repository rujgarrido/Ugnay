# TaskFlow — Architecture

## Style

Modular Monolith, package-by-feature, layered responsibilities:

Route/Controller → Service → Repository/Data Access → PostgreSQL

## Module boundaries

* server/src/features/users
* server/src/features/projects
* server/src/features/boards
* server/src/features/tasks
* server/src/features/comments

