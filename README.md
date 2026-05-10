# miniudemy

A complete microservices-based online course platform built with Node.js, Express, MongoDB, RabbitMQ, and React.

## 1. Project Overview
This project is **miniudemy**, a fully functional educational platform. It consists of four independent microservices communicating via HTTP and RabbitMQ, a React frontend, and a fully dockerized environment.

## 2. Microservices Architecture
- **API Gateway (8080)**: An NGINX reverse proxy that routes all incoming client requests to the appropriate backend microservices, solving CORS issues and providing a single entry point.
- **Auth Service (5001)**: Manages user registration, login, and JWT authentication.
- **Course Service (5002)**: Handles course creation, listing, and enrollment.
- **Progress Service (5003)**: Tracks lesson completion and overall course progress.
- **Notification Service (5004)**: Consumes asynchronous events via RabbitMQ to generate notifications.

## 3. Technologies Used
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), RabbitMQ, JWT, bcryptjs
- **Frontend**: React, Vite, TailwindCSS, Axios, React Router
- **Infrastructure**: Docker, Docker Compose, NGINX (API Gateway)

## 4. Folder Structure
```text
miniudemy/
├── api-gateway/         # NGINX Reverse Proxy Configuration
├── auth-service/        # Authentication Microservice
├── course-service/      # Course Management Microservice
├── progress-service/    # Progress Tracking Microservice
├── notification-service/# Notifications Microservice
├── frontend/            # React/Vite Frontend
├── shared/              # Shared Utilities (RabbitMQ, Middleware)
├── docker-compose.yml   # Docker Orchestration
└── package.json         # Workspace Configuration
```

## 5. RabbitMQ Communication Flow
1. **Student** enrolls in a course via the `Course Service`.
2. `Course Service` publishes a `course.enrolled` event to RabbitMQ.
3. `Notification Service` listens to the `course.enrolled` event.
4. Upon receiving the event, `Notification Service` automatically generates a notification for the student.

## 6. Docker Setup
Each microservice has its own `Dockerfile`. A root `docker-compose.yml` orchestrates the services, 4 independent MongoDB databases, a RabbitMQ container, and the frontend.

## 7. Running with Docker Compose
To run the entire platform, make sure Docker is installed and running, then execute:
```bash
npm start
```
*Or directly via Docker Compose:*
```bash
docker compose up --build
```
This will start all containers. The React Frontend will be available at [http://localhost:5173](http://localhost:5173).

## 8. API Endpoints
### Auth Service
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Course Service
- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses/:id/enroll`

### Progress Service
- `POST /api/progress/complete-lesson`
- `GET /api/progress/my-progress`
- `GET /api/progress/:courseId`

### Notification Service
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

## 9. Team Members
- Rida Mouhdi
- Mbarek Hani
- Ayoub Jakouri
- Yassine Azarguy
