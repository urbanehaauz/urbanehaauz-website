# Docker Setup Instructions

This guide will help you run the Urbane Haauz Boutique Hotel Management System using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

The application will be available at: **http://localhost:3001**

### 2. Stop the Container

```bash
# Stop the container
docker-compose down

# Stop and remove volumes (if needed)
docker-compose down -v
```

### 3. View Logs

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f web
```

## Manual Docker Commands

If you prefer using Docker commands directly:

### Build the Image

```bash
docker build -t urbane-haauz:latest .
```

### Run the Container

```bash
docker run -d -p 3001:3001 --name urbane-haauz-web urbane-haauz:latest
```

### Stop and Remove Container

```bash
docker stop urbane-haauz-web
docker rm urbane-haauz-web
```

## Accessing the Application

Once the container is running, access the application at:
- **Main Application**: http://localhost:3001
- **Home Page**: http://localhost:3001/#/
- **Rooms**: http://localhost:3001/#/rooms
- **Admin Login**: http://localhost:3001/#/admin/login

**Admin Credentials:**
- Username: `admin`
- Password: `admin`

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, you can change it in `docker-compose.yml`:

```yaml
ports:
  - "3002:3001"  # Change 3002 to any available port
```

### Rebuild After Code Changes

```bash
# Stop current container
docker-compose down

# Rebuild and start
docker-compose up --build
```

### Check Container Status

```bash
# List running containers
docker ps

# Check container logs
docker logs urbane-haauz-web
```

### Remove Everything and Start Fresh

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove the image
docker rmi urbane-haauz-web

# Rebuild from scratch
docker-compose up --build
```

## Development vs Production

- **Development**: Use `npm run dev` for hot-reload development
- **Production**: Use Docker for production deployment

## Notes

- The Docker setup uses Nginx to serve the production build
- All routes are handled by React Router (client-side routing)
- Static assets are cached for better performance
- The container runs in production mode
