# Quick Start - Docker

## ✅ Docker Setup Complete!

The Urbane Haauz Boutique Hotel Management System is now dockerized and ready to use.

## 🚀 Start the Application

```bash
# Start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🌐 Access the Application

The application is now running at:
- **http://localhost:3001**

**Admin Login:**
- Username: `admin`
- Password: `admin`

## 📋 Common Commands

```bash
# Start container
docker-compose up -d

# Stop container
docker-compose down

# Rebuild after code changes
docker-compose up --build -d

# View logs
docker-compose logs -f

# Check container status
docker ps
```

## 🔧 Troubleshooting

If port 3001 is in use, edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "3002:3001"  # Use port 3002 instead
```

For more details, see [DOCKER_INSTRUCTIONS.md](./DOCKER_INSTRUCTIONS.md)
