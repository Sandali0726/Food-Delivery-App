# Yumy - Food Delivery Platform

<div align="center">
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Java Version](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.2-purple)](https://vitejs.dev/)
</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
  - [Functional Features](#functional-features)
  - [Non-Functional Features](#non-functional-features)
- [Architecture & Technologies](#-architecture--technologies)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Project Overview

**Yumy** is a comprehensive food delivery platform that connects customers, restaurants, and delivery riders in a seamless digital ecosystem. The platform enables customers to browse restaurants, place orders, track deliveries in real-time, and rate their experience—all while providing robust management tools for restaurants and riders.

### Key Objectives

- **Seamless Food Ordering**: Enable customers to discover restaurants, browse menus, and place orders effortlessly
- **Real-Time Tracking**: Provide live delivery tracking with WebSocket-powered location updates
- **Multi-Role Platform**: Dedicated dashboards for customers, restaurants, and delivery riders
- **Scalable Architecture**: Microservices-based design with gRPC inter-service communication
- **Secure & Reliable**: JWT authentication, Google OAuth, and secure payment processing

### System Design

Yumy employs a **microservices architecture** with three independently deployable services:

- **Customer Service**: Manages customer authentication, profiles, orders, and reviews
- **Restaurant Service**: Handles restaurant profiles, menus, orders, and delivery requests
- **Rider Service**: Manages rider authentication, delivery tasks, real-time location tracking

All services communicate via **gRPC** for high-performance inter-service calls and use **Apache Kafka** for asynchronous event-driven communication. The frontend clients (Customer, Restaurant, Rider) are built with **React** and **Vite**, providing responsive, real-time user experiences.

---

## ✨ Features

### Functional Features

#### 🔐 Authentication & User Management
- Secure email/password authentication with JWT tokens
- **Google OAuth 2.0** integration for quick sign-up/login
- Email verification with OTP (One-Time Password) for new users
- Password reset functionality
- Role-based access control (Customer, Restaurant, Rider)
- Profile management with **Cloudinary** image uploads

#### 👤 Customer Features
- Browse restaurants by location with **Mapbox** integration
- Search and filter restaurants by cuisine, rating, distance
- View restaurant menus with detailed food item information
- Add items to cart and customize quantities
- Place orders with delivery address selection
- **Real-time order tracking** via WebSocket
- **Live rider location tracking** on map during delivery
- View order history and status updates
- Rate and review restaurants and riders
- Google OAuth quick login

#### 🍽️ Restaurant Features
- Create and manage restaurant profiles
- Upload restaurant images via **Cloudinary**
- Manage menu items (create, update, delete)
- Receive new orders in real-time via WebSocket
- Update order status (Accepted, Preparing, Ready, Completed)
- Request delivery riders via **Kafka events**
- View order history and analytics
- Monitor revenue and order statistics
- Manage restaurant location with coordinates

#### 🚴 Rider Features
- Register with profile image and vehicle details
- Email verification before registration
- View available delivery orders in nearby area (10km radius)
- Accept delivery tasks with distance and time calculations
- **Real-time location tracking** shared with customers
- Update delivery status (Accepted, Picked Up, Delivered)
- Navigate to pickup and delivery locations with **Mapbox**
- View delivery history and earnings
- Receive ratings and reviews from customers
- OTP verification for order delivery

#### 📧 Real-Time Communication
- **WebSocket (STOMP)** for live updates:
  - Order status changes
  - New order notifications for restaurants
  - Rider location updates for customers
  - Delivery notifications
- **Apache Kafka** for event streaming:
  - Order creation events
  - Order status updates
  - Delivery request broadcasts
  - Order completion events

### Non-Functional Features

#### ⚡ Performance
- gRPC for high-performance inter-service communication
- WebSocket for real-time bidirectional updates
- Efficient database queries with JPA/Hibernate
- Connection pooling with HikariCP
- Lazy loading for images and components

#### 📈 Scalability
- Microservices architecture for independent scaling
- Stateless services with JWT authentication
- Kafka message queues for decoupled communication
- PostgreSQL database with optimized indexes
- Containerized services with Docker

#### 🛡️ Reliability
- Graceful error handling across all services
- gRPC retries and timeout configurations
- Database transaction management
- WebSocket reconnection logic
- Kafka consumer acknowledgment

#### 🔒 Security
- JWT-based authentication with secure token storage
- Google OAuth 2.0 for trusted authentication
- Password hashing with BCrypt
- Email verification for new accounts
- CORS configuration for secure cross-origin requests
- Input validation across all endpoints
- OTP verification for critical operations

#### 📱 Usability
- Mobile-first responsive design with Tailwind CSS
- Real-time map integration with Mapbox
- Intuitive user interfaces for all user roles
- Interactive order tracking
- Toast notifications for user feedback
- Framer Motion animations for smooth UX

#### 🔍 Observability
- Structured logging across all services
- gRPC request/response logging
- Kafka consumer/producer logging
- Database query logging
- WebSocket connection monitoring

#### 🔧 Maintainability
- Clean code architecture with separation of concerns
- MapStruct for efficient DTO-Entity mapping
- Lombok for boilerplate reduction
- Modular service structure
- Comprehensive error handling

#### 🐳 Portability
- Full Docker containerization for all services
- Docker Compose orchestration
- Environment-based configuration
- Cross-platform compatibility

---

## 🏗️ Architecture & Technologies

### Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Java** | Programming language | 17 |
| **Spring Boot** | Application framework | 3.5.8 / 4.0.0 |
| **Spring Data JPA** | Database ORM | - |
| **Spring Security** | Authentication & authorization | - |
| **Spring Kafka** | Event streaming | - |
| **Spring WebSocket** | Real-time communication | - |
| **gRPC** | Inter-service communication | 1.77.0 |
| **Protocol Buffers** | Data serialization | 3.25.3 |
| **PostgreSQL** | Relational database | Latest |
| **JWT** | Token-based authentication | 0.11.5 |
| **MapStruct** | Object mapping | 1.6.2 |
| **Lombok** | Boilerplate reduction | Latest |
| **Cloudinary** | Image storage | 1.38.0 |
| **Jakarta Mail** | Email service | - |
| **BCrypt** | Password hashing | - |

### Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 18.2 / 19.2 |
| **Vite** | Build tool | 7.2 |
| **React Router** | Client-side routing | 6.20 / 7.10 |
| **Redux Toolkit** | State management | 2.11.2 |
| **Tailwind CSS** | Utility-first CSS | 3.4 / 4.1 |
| **Axios** | HTTP client | 1.13.2 |
| **STOMP.js** | WebSocket client | 7.2.1 |
| **SockJS** | WebSocket fallback | 1.6.1 |
| **Mapbox GL** | Interactive maps | 3.17.0 |
| **React Leaflet** | Map components | 4.2 / 5.0 |
| **Framer Motion** | Animations | 12.23 |
| **Material-UI** | React components | 7.3.6 |
| **Lucide React** | Icon library | Latest |

### DevOps & Infrastructure

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Web server for frontend |
| **Gradle** | Build automation (backend) |
| **npm** | Package management (frontend) |
| **Git** | Version control |

---

## 🔄 System Architecture

### Microservices Overview

Each user type (Customer, Restaurant, Rider) has a completely independent stack with its own web application, backend service, and database. Services communicate via gRPC and Kafka for cross-service operations.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            CUSTOMER STACK                                         │
│  URL: http://localhost:3000                                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐          ┌──────────────────┐         ┌─────────────────┐  │
│  │  Customer Web   │  HTTP/WS │ Customer Service │   JDBC  │   PostgreSQL    │  │
│  │ (React + Vite)  │◄────────►│  (Spring Boot)   │◄───────►│  yumy_customer  │  │
│  │   Port: 3000    │          │   Port: 8085     │         │                 │  │
│  └─────────────────┘          │   gRPC: 9090     │         └─────────────────┘  │
│                                └──────────────────┘                              │
└────────────────────────────────────┬─────────────────────────────────────────────┘
                                     │ gRPC & Kafka
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           RESTAURANT STACK                                        │
│  URL: http://localhost:5174                                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐          ┌──────────────────┐         ┌─────────────────┐  │
│  │ Restaurant Web  │  HTTP/WS │Restaurant Service│   JDBC  │   PostgreSQL    │  │
│  │ (React + Vite)  │◄────────►│  (Spring Boot)   │◄───────►│ yumy_restaurant │  │
│  │   Port: 5174    │          │   Port: 8083     │         │                 │  │
│  └─────────────────┘          │   gRPC: 9091     │         └─────────────────┘  │
│                                └──────────────────┘                              │
└────────────────────────────────────┬─────────────────────────────────────────────┘
                                     │ gRPC & Kafka
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             RIDER STACK                                           │
│  URL: http://localhost:5173                                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐          ┌──────────────────┐         ┌─────────────────┐  │
│  │   Rider Web     │  HTTP/WS │  Rider Service   │   JDBC  │   PostgreSQL    │  │
│  │ (React + Vite)  │◄────────►│  (Spring Boot)   │◄───────►│   yumy_rider    │  │
│  │   Port: 5173    │          │   Port: 8080     │         │                 │  │
│  └─────────────────┘          │   gRPC: 9092     │         └─────────────────┘  │
│                                └──────────────────┘                              │
└────────────────────────────────────┬─────────────────────────────────────────────┘
                                     │
                    ┌────────────────┴──────────────────┐
                    │                                   │
         ┌──────────▼──────────┐          ┌────────────▼────────────┐
         │   Apache Kafka      │          │   gRPC Communication    │
         │  Event Streaming    │          │   Inter-Service Calls   │
         │  - Order Events     │          │   - Customer Details    │
         │  - Status Updates   │          │   - Restaurant Info     │
         │  - Delivery Tasks   │          │   - Rider Location      │
         └─────────────────────┘          └─────────────────────────┘

External Services (Shared):
├─ Cloudinary (Image Storage)
├─ Gmail SMTP (Email Service)
└─ Mapbox (Maps & Geocoding)
```

### Key Architecture Points

1. **Independent Stacks**: Each user role operates on a completely separate application stack
   - **Customer Stack**: Customers access their own web app (Port 3000) → Customer Service (Port 8085) → Customer Database
   - **Restaurant Stack**: Restaurants access their own web app (Port 5174) → Restaurant Service (Port 8083) → Restaurant Database  
   - **Rider Stack**: Riders access their own web app (Port 5173) → Rider Service (Port 8080) → Rider Database

2. **Separate Databases**: Each service has its own PostgreSQL database for data isolation
   - `yumy_customer` - Stores customer profiles, orders, reviews
   - `yumy_restaurant` - Stores restaurant profiles, menus, order processing data
   - `yumy_rider` - Stores rider profiles, delivery tasks, location history

3. **Inter-Service Communication**:
   - **gRPC**: Synchronous calls for real-time data (e.g., fetching customer details, rider location)
   - **Kafka**: Asynchronous event streaming for order flow and status updates
   - **WebSocket**: Real-time updates within each stack (order status, location tracking)

### Communication Patterns

1. **Synchronous (gRPC)**:
   - Customer Service ↔ Restaurant Service (restaurant details, order details)
   - Customer Service ↔ Rider Service (rider details, location)
   - Rider Service ↔ Customer Service (order details, customer info)
   - Restaurant Service ↔ Rider Service (rider assignment)

2. **Asynchronous (Kafka)**:
   - Order Created → Restaurant Service
   - Order Status Updated → Customer Service
   - Order Ready → Rider Service
   - Order Delivered → Customer Service

3. **Real-Time (WebSocket/STOMP)**:
   - Customer: Order status updates, rider location
   - Restaurant: New order notifications
   - Rider: New delivery requests, location broadcasts

---

## 📋 Prerequisites

Before setting up Yumy, ensure you have the following installed:

- **Java JDK**: 17 or higher ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **Docker**: Latest version ([Download](https://www.docker.com/))
- **Docker Compose**: v2.x or higher
- **PostgreSQL**: 14+ (or use cloud provider)
- **Git**: Latest version ([Download](https://git-scm.com/))

### External Accounts Required

- **PostgreSQL Database** (Supabase/Neon/AWS RDS recommended)
- **Cloudinary Account** ([Sign up](https://cloudinary.com/))
- **Gmail Account** (for SMTP email service)
- **Mapbox Account** ([Sign up](https://www.mapbox.com/))
- **Google Cloud Account** (for OAuth 2.0) ([Sign up](https://cloud.google.com/))

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/yumy.git
cd yumy
```

### 2. Install Dependencies

#### Backend Services (Spring Boot)

```bash
# Customer Service
cd server/customer_service
./gradlew build

# Restaurant Service
cd ../restaurant_service
./gradlew build

# Rider Service
cd ../RiderService
./gradlew build
```

#### Frontend Clients

```bash
# Customer Client
cd client/customer
npm install

# Restaurant Client
cd ../Restaurant_Client
npm install

# Rider Client
cd ../RiderClient
npm install
```

### 3. Database Setup

#### PostgreSQL Database

1. Create three databases (or one shared database):
   - `yumy_customer` (for Customer Service)
   - `yumy_restaurant` (for Restaurant Service)
   - `yumy_rider` (for Rider Service)

2. Note your database credentials:
   - Host and port
   - Database name
   - Username and password

**Using Supabase/Neon** (Recommended):
- Sign up at [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)
- Create a new project
- Copy the connection string

### 4. Apache Kafka Setup

#### Option 1: Local Kafka (Docker)

```bash
# Create docker-compose-kafka.yml
version: '3.9'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

# Start Kafka
docker-compose -f docker-compose-kafka.yml up -d
```

#### Option 2: Cloud Kafka (Confluent Cloud/AWS MSK)
- Use your cloud provider's Kafka connection string

---

## ⚙️ Configuration

### Customer Service Configuration

Create `server/customer_service/.env`:

```env
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/yumy_customer?sslmode=require
SPRING_DATASOURCE_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_min_256_bits

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Gmail SMTP)
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# gRPC Ports
GRPC_SERVER_PORT=9090
GRPC_RESTAURANT_HOST=localhost
GRPC_RESTAURANT_PORT=9091
GRPC_RIDER_HOST=localhost
GRPC_RIDER_PORT=9092
```

### Restaurant Service Configuration

Create `server/restaurant_service/.env`:

```env
# Database Configuration
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=yumy_restaurant
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_min_256_bits

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# gRPC Configuration
GRPC_SERVER_PORT=9091
GRPC_CUSTOMER_HOST=localhost
GRPC_CUSTOMER_PORT=9090
GRPC_RIDER_HOST=localhost
GRPC_RIDER_PORT=9092
```

### Rider Service Configuration

Create `server/RiderService/src/.env`:

```env
# Database Configuration
DB_URL=jdbc:postgresql://your-db-host:5432/yumy_rider?sslmode=require
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_min_256_bits

# Email Configuration (Gmail)
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# gRPC Configuration
GRPC_SERVER_PORT=9092
GRPC_CUSTOMER_HOST=localhost
GRPC_CUSTOMER_PORT=9090
GRPC_RESTAURANT_HOST=localhost
GRPC_RESTAURANT_PORT=9091
```

### Frontend Configuration

#### Customer Client

Create `client/customer/.env`:

```env
# Backend API URLs
REACT_APP_CUSTOMER_URL=http://localhost:8085
REACT_APP_RESTAURANT_URL=http://localhost:8083

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Mapbox
REACT_APP_MAPBOX_TOKEN=your_mapbox_access_token
```

#### Restaurant Client

Create `client/Restaurant_Client/.env`:

```env
VITE_API_BASE_URL=http://localhost:8083/api
VITE_WS_URL=http://localhost:8083
```

#### Rider Client

Create `client/RiderClient/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

---

## 💻 Usage

### Running Services Locally

#### Option 1: Using Docker Compose (Recommended)

**Start Customer Service & Client:**
```bash
cd DockerComposeCustomer
docker-compose up --build
```
- Customer Service: http://localhost:8085
- Customer Client: http://localhost:3000

**Start Restaurant Service & Client:**
```bash
cd DockerComposeRestaurant
docker-compose up --build
```
- Restaurant Service: http://localhost:8083
- Restaurant Client: http://localhost:5174

**Start Rider Service & Client:**
```bash
cd DockerComposeRider
docker-compose up --build
```
- Rider Service: http://localhost:8080
- Rider Client: http://localhost:5173

#### Option 2: Manual Startup

**Start Backend Services:**

```bash
# Terminal 1 - Customer Service
cd server/customer_service
./gradlew bootRun

# Terminal 2 - Restaurant Service
cd server/restaurant_service
./gradlew bootRun

# Terminal 3 - Rider Service
cd server/RiderService
./gradlew bootRun
```

**Start Frontend Clients:**

```bash
# Terminal 4 - Customer Client
cd client/customer
npm start

# Terminal 5 - Restaurant Client
cd client/Restaurant_Client
npm run dev

# Terminal 6 - Rider Client
cd client/RiderClient
npm run dev
```

### Service Endpoints

| Service | HTTP Port | gRPC Port | Health Check |
|---------|-----------|-----------|--------------|
| Customer Service | 8085 | 9090 | http://localhost:8085/api/hello |
| Restaurant Service | 8083 | 9091 | http://localhost:8083/api/hello |
| Rider Service | 8080 | 9092 | http://localhost:8080/api/auth/hello |

| Client | Port | URL |
|--------|------|-----|
| Customer | 3000 | http://localhost:3000 |
| Restaurant | 5174 | http://localhost:5174 |
| Rider | 5173 | http://localhost:5173 |

### Sample Workflows

#### 1. Customer Orders Food

1. **Register/Login**:
   - Navigate to http://localhost:3000
   - Sign up with email or use Google OAuth
   - Verify email with OTP code

2. **Browse Restaurants**:
   - View nearby restaurants on the map
   - Filter by cuisine or search
   - Click a restaurant to view menu

3. **Place Order**:
   - Add items to cart
   - Enter delivery address
   - Confirm order

4. **Track Delivery**:
   - View real-time order status
   - Track rider location on map
   - Receive delivery confirmation

5. **Rate Experience**:
   - Rate restaurant and food
   - Rate rider service

#### 2. Restaurant Manages Orders

1. **Register/Login**:
   - Navigate to http://localhost:5174
   - Create restaurant account with details
   - Upload restaurant images

2. **Manage Menu**:
   - Add food items with photos
   - Set prices and descriptions
   - Update availability

3. **Process Orders**:
   - Receive new order notifications (WebSocket)
   - Accept order
   - Update status to "Preparing"
   - Mark as "Ready for Pickup"
   - Request rider delivery

4. **View Analytics**:
   - Check order history
   - Monitor revenue
   - View ratings and reviews

#### 3. Rider Delivers Orders

1. **Register/Login**:
   - Navigate to http://localhost:5173
   - Sign up with profile photo and vehicle details
   - Verify email with OTP

2. **Accept Deliveries**:
   - View available orders nearby (10km radius)
   - See distance and estimated time
   - Accept delivery task

3. **Complete Delivery**:
   - Navigate to restaurant (Mapbox)
   - Mark "Picked Up"
   - Navigate to customer location
   - Share live location (WebSocket)
   - Verify OTP with customer
   - Complete delivery

4. **View History**:
   - Check completed deliveries
   - View earnings
   - See customer ratings

---

## 🧪 Testing

### Backend Testing

Each service includes test support:

```bash
# Run tests for Customer Service
cd server/customer_service
./gradlew test

# Run tests for Restaurant Service
cd server/restaurant_service
./gradlew test

# Run tests for Rider Service
cd server/RiderService
./gradlew test
```

### Frontend Testing

```bash
# Customer Client tests
cd client/customer
npm test

# Restaurant Client tests
cd client/Restaurant_Client
npm test

# Rider Client tests
cd client/RiderClient
npm test
```

### Integration Testing

Test the complete flow:

1. Start all services (backend + frontend)
2. Create a customer account
3. Create a restaurant account and add menu items
4. Create a rider account
5. Place an order as customer
6. Accept and process order as restaurant
7. Accept delivery as rider
8. Track delivery as customer
9. Complete delivery as rider

### API Testing with Postman

Import the example requests from `REQUEST_EXAMPLES.md` into Postman.

**Example: Register Rider**

```bash
POST http://localhost:8080/api/auth/register-form
Content-Type: multipart/form-data

Form Data:
- email: rider@example.com
- password: password123
- first_name: John
- last_name: Doe
- phone_number: +1234567890
- default_lat: 40.7128
- default_lng: -74.0060
- licence: ABC123456
- vehicle_no: XYZ-789
- file: [profile image]
```

---

## 🚢 Deployment

### Docker Deployment (Production)

#### 1. Build Production Images

```bash
# Customer Service
cd DockerComposeCustomer
docker-compose build

# Restaurant Service
cd ../DockerComposeRestaurant
docker-compose build

# Rider Service
cd ../DockerComposeRider
docker-compose build
```

#### 2. Deploy to Cloud

**Using Docker Swarm:**

```bash
docker swarm init
docker stack deploy -c docker-compose.yml yumy-customer
docker stack deploy -c docker-compose.yml yumy-restaurant
docker stack deploy -c docker-compose.yml yumy-rider
```

**Using Kubernetes:**

```bash
# Generate Kubernetes manifests
kompose convert -f docker-compose.yml

# Deploy to cluster
kubectl apply -f .
```

### Environment Variables in Production

**Security Checklist:**

- [ ] Use environment-specific `.env` files
- [ ] Never commit `.env` files to Git
- [ ] Use secrets management (AWS Secrets Manager, Azure Key Vault)
- [ ] Rotate JWT secrets regularly
- [ ] Use production-grade databases
- [ ] Enable SSL/TLS for all services
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure monitoring and logging

### Cloud Platform Deployment

#### AWS Deployment

1. **Database**: Use AWS RDS for PostgreSQL
2. **Kafka**: Use Amazon MSK (Managed Streaming for Kafka)
3. **Container**: Deploy to AWS ECS or EKS
4. **Storage**: Use S3 with Cloudinary
5. **Load Balancer**: Application Load Balancer

#### Google Cloud Deployment

1. **Database**: Cloud SQL for PostgreSQL
2. **Kafka**: Confluent Cloud or self-hosted on GKE
3. **Container**: Google Kubernetes Engine (GKE)
4. **Storage**: Cloud Storage with Cloudinary
5. **Load Balancer**: Cloud Load Balancing

---

## 📁 Project Structure

```
yumy/
├── client/                          # Frontend Applications
│   ├── customer/                    # Customer React App
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/          # Reusable components
│   │   │   ├── pages/               # Page components
│   │   │   │   ├── Auth/            # Login, Signup, Verify
│   │   │   │   ├── Home/            # Homepage
│   │   │   │   ├── Order/           # Order tracking
│   │   │   │   ├── Profile/         # User profile
│   │   │   │   └── Restaurant/      # Restaurant details
│   │   │   ├── services/            # API services
│   │   │   │   ├── api.js           # API endpoints
│   │   │   │   └── socket.js        # WebSocket service
│   │   │   ├── Function/            # Utility functions
│   │   │   ├── assets/              # Images, icons
│   │   │   ├── App.js
│   │   │   └── index.js
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   │
│   ├── Restaurant_Client/           # Restaurant Vite App
│   │   ├── src/
│   │   │   ├── api/                 # API client
│   │   │   ├── assets/              # Static assets
│   │   │   ├── component/           # UI components
│   │   │   ├── features/            # Redux features
│   │   │   ├── layouts/             # Page layouts
│   │   │   ├── pages/               # Page components
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── MenuManagement.jsx
│   │   │   │   ├── OrderManagement.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── routes/              # Route configuration
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── store.js             # Redux store
│   │   ├── Dockerfile
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   └── RiderClient/                 # Rider Vite App
│       ├── src/
│       │   ├── api/                 # API services
│       │   │   ├── auth.js
│       │   │   ├── delivery.js
│       │   │   └── location.js
│       │   ├── components/          # UI components
│       │   │   ├── DeliveryMap.jsx  # Real-time map
│       │   │   └── LocationPermissionModal.jsx
│       │   ├── contexts/            # React contexts
│       │   ├── features/            # Redux slices
│       │   ├── hooks/               # Custom hooks
│       │   │   └── useLocationTracking.js
│       │   ├── pages/
│       │   │   ├── dashbord.jsx     # Main dashboard
│       │   │   ├── Login.jsx
│       │   │   └── Register.jsx
│       │   ├── socketSubscribers/   # WebSocket handlers
│       │   ├── utils/               # Utilities
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── Dockerfile
│       └── package.json
│
├── server/                          # Backend Microservices
│   ├── customer_service/            # Customer Service (Port 8085)
│   │   ├── src/main/java/com/yumi/userservice/
│   │   │   ├── config/              # Spring configuration
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── OAuth2LoginSuccessHandler.java
│   │   │   │   ├── WebSocketConfig.java
│   │   │   │   └── GrpcClientConfig.java
│   │   │   ├── controller/          # REST controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── CustomerController.java
│   │   │   │   ├── OrderController.java
│   │   │   │   └── Oauth2Controller.java
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── mapper/              # MapStruct mappers
│   │   │   ├── model/               # JPA entities
│   │   │   │   ├── Auth.java
│   │   │   │   ├── Customer.java
│   │   │   │   ├── Order.java
│   │   │   │   └── OrderItem.java
│   │   │   ├── repository/          # JPA repositories
│   │   │   ├── service/             # Business logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── OrderService.java
│   │   │   │   ├── kafka/           # Kafka consumers
│   │   │   │   ├── grpc/            # gRPC servers
│   │   │   │   └── grpcClient/      # gRPC clients
│   │   │   └── UserServiceApplication.java
│   │   ├── src/main/proto/          # Protocol Buffer definitions
│   │   ├── src/main/resources/
│   │   │   └── application.properties
│   │   ├── Dockerfile
│   │   ├── build.gradle
│   │   └── .env
│   │
│   ├── restaurant_service/          # Restaurant Service (Port 8083)
│   │   ├── src/main/java/com/restaurant_service/
│   │   │   ├── config/              # Configuration
│   │   │   ├── controller/          # REST API
│   │   │   │   ├── Auth_Controller.java
│   │   │   │   ├── Food_Controller.java
│   │   │   │   ├── Profile_Controller.java
│   │   │   │   ├── RestaurantOrderController.java
│   │   │   │   └── RiderController.java
│   │   │   ├── dto/                 # DTOs
│   │   │   ├── enums/               # Enumerations
│   │   │   ├── grpc/                # gRPC clients
│   │   │   ├── mapper/              # MapStruct
│   │   │   ├── model/               # Entities
│   │   │   │   ├── Auth_User.java
│   │   │   │   ├── Food_Item.java
│   │   │   │   ├── Resturant_Profile.java
│   │   │   │   ├── RestaurantOrder.java
│   │   │   │   └── DeliveryRequestLog.java
│   │   │   ├── repository/          # Data access
│   │   │   ├── service/             # Business logic
│   │   │   │   ├── consumer/        # Kafka consumers
│   │   │   │   ├── producer/        # Kafka producers
│   │   │   │   └── impl/            # Service implementations
│   │   │   └── RestaurantServiceApplication.java
│   │   ├── src/main/proto/          # Proto files
│   │   ├── Dockerfile
│   │   └── build.gradle
│   │
│   └── RiderService/                # Rider Service (Port 8080)
│       ├── src/main/java/com/example/riderservice/
│       │   ├── config/              # Configuration
│       │   │   ├── springSecurityConfig.java
│       │   │   ├── WebSocketConfig.java
│       │   │   ├── GrpcClientConfig.java
│       │   │   └── JwtFilter.java
│       │   ├── controller/          # REST endpoints
│       │   │   ├── authController.java
│       │   │   ├── deliveryController.java
│       │   │   └── orderController.java
│       │   ├── dto/                 # Data transfer objects
│       │   ├── enums/               # Status enums
│       │   ├── grpcClientService/   # gRPC clients
│       │   ├── grpcServer/          # gRPC servers
│       │   ├── kafkaConsumerServices/ # Kafka listeners
│       │   ├── model/               # JPA entities
│       │   │   ├── auth.java
│       │   │   ├── rider.java
│       │   │   ├── order.java
│       │   │   └── delivery_task.java
│       │   ├── repository/          # Repositories
│       │   ├── service/             # Business services
│       │   │   ├── authService.java
│       │   │   ├── orderService.java
│       │   │   ├── deliveryService.java
│       │   │   └── emailVerificationService.java
│       │   ├── webSocket/           # WebSocket publishers
│       │   └── RiderServiceApplication.java
│       ├── src/main/proto/          # Protocol Buffers
│       ├── src/Docker/
│       │   └── Dockerfile
│       ├── build.gradle
│       ├── EMAIL_VERIFICATION_README.md
│       └── DOCKER_README.md
│
├── DockerComposeCustomer/
│   └── docker-compose.yml
├── DockerComposeRestaurant/
│   └── docker-compose.yml
├── DockerComposeRider/
│   └── docker-compose.yml
│
├── REQUEST_EXAMPLES.md
├── package.json
└── README.md (this file)
```

### Service Responsibilities

| Service | Port | gRPC | Responsibilities |
|---------|------|------|-----------------|
| **Customer Service** | 8085 | 9090 | Authentication, customer profiles, order management, reviews, WebSocket order updates, gRPC server for customer/order data |
| **Restaurant Service** | 8083 | 9091 | Restaurant profiles, menu management, order processing, delivery requests, revenue analytics, gRPC server for restaurant data |
| **Rider Service** | 8080 | 9092 | Rider authentication, delivery task management, real-time location tracking, email verification, gRPC server for rider data |

---

## 📚 API Documentation

### Customer Service Endpoints

#### Authentication

**Register Customer**
```http
POST /api/customers/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "SecurePass123"
}
```

**Login**
```http
POST /api/customers/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "SecurePass123"
}
```

**Google OAuth Login**
```http
GET /oauth2/authorization/google
```

**Send Email OTP**
```http
POST /api/customers/send-code?email=customer@example.com&purpose=VERIFY_EMAIL
```

**Verify Email OTP**
```http
POST /api/customers/verify-code?email=customer@example.com&code=123456&purpose=VERIFY_EMAIL
```

#### Orders

**Create Order**
```http
POST /api/order/save
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerEmail": "customer@example.com",
  "restaurantEmail": "restaurant@example.com",
  "orderItems": [
    {
      "itemName": "Burger",
      "quantity": 2,
      "price": 10.99
    }
  ],
  "orderPrice": 21.98,
  "deliveryLat": 40.7128,
  "deliveryLng": -74.0060,
  "address": "123 Main St, New York"
}
```

**Get Customer Orders**
```http
GET /api/order/{customerEmail}
Authorization: Bearer {token}
```

**Cancel Order**
```http
PUT /api/order/cancel/{orderId}
Authorization: Bearer {token}
```

#### Reviews

**Submit Restaurant Review**
```http
PUT /api/restaurants/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "restaurantEmail": "restaurant@example.com",
  "customerEmail": "customer@example.com",
  "rating": 5,
  "comment": "Excellent food!"
}
```

**Submit Rider Review**
```http
PUT /api/customers/rider/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "riderEmail": "rider@example.com",
  "customerEmail": "customer@example.com",
  "rating": 5,
  "comment": "Fast delivery!"
}
```

### Restaurant Service Endpoints

#### Authentication

**Register Restaurant**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "restaurant@example.com",
  "password": "SecurePass123"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "restaurant@example.com",
  "password": "SecurePass123"
}
```

#### Profile Management

**Create/Update Profile**
```http
POST /api/profile/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "restaurant@example.com",
  "restaurantName": "Best Burgers",
  "address": "456 Food St",
  "phone": "+1234567890",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "profilePicture": "https://cloudinary.com/..."
}
```

**Get All Restaurants**
```http
GET /api/profile/all
```

#### Menu Management

**Add Food Item**
```http
POST /api/food/save
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemName": "Cheeseburger",
  "description": "Delicious burger with cheese",
  "price": 12.99,
  "availability": true,
  "imageUrl": "https://cloudinary.com/...",
  "restaurantEmail": "restaurant@example.com"
}
```

**Get Restaurant Menu**
```http
GET /api/food/restaurant/{restaurantEmail}
```

**Update Food Item**
```http
PUT /api/food/{foodId}
Authorization: Bearer {token}
Content-Type: application/json
```

**Delete Food Item**
```http
DELETE /api/food/{foodId}
Authorization: Bearer {token}
```

#### Order Management

**Get Restaurant Orders**
```http
GET /api/orders?status=PENDING&page=0&size=10
Authorization: Bearer {token}
```

**Update Order Status**
```http
PATCH /api/orders/{orderId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "ACCEPTED"
}
```

**Get Revenue**
```http
GET /api/orders/revenue
Authorization: Bearer {token}
```

### Rider Service Endpoints

#### Authentication

**Register Rider (Multipart Form)**
```http
POST /api/auth/register-form
Content-Type: multipart/form-data

Form Data:
- email: rider@example.com
- password: password123
- first_name: John
- last_name: Doe
- phone_number: +1234567890
- default_lat: 40.7128
- default_lng: -74.0060
- licence: DL123456
- vehicle_no: ABC-789
- file: [image file]
```

**Send Email Verification OTP**
```http
POST /api/auth/send-email-otp?email=rider@example.com
```

**Verify Email OTP**
```http
POST /api/auth/verify-email-otp
Content-Type: application/json

{
  "email": "rider@example.com",
  "otp": "123456"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "rider@example.com",
  "password": "password123"
}
```

#### Delivery Management

**Get Available Orders**
```http
GET /api/orders/available
Authorization: Bearer {token}
```

**Accept Delivery**
```http
POST /api/delivery/accept/{orderId}
Authorization: Bearer {token}
```

**Get Active Deliveries**
```http
GET /api/delivery/active
Authorization: Bearer {token}
```

**Update Delivery Status**
```http
PUT /api/delivery/{deliveryId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "PICKED_UP"
}
```

**Complete Delivery with OTP**
```http
POST /api/delivery/{deliveryId}/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "otp": "1234"
}
```

#### Location Tracking

**Update Current Location**
```http
POST /api/rider/location
Authorization: Bearer {token}
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### WebSocket Endpoints

#### Customer WebSocket

**Connect**
```
ws://localhost:8085/ws
```

**Subscribe to Order Updates**
```
/topic/orders/{orderId}
```

**Subscribe to Rider Location**
```
/topic/rider-location/{orderId}
```

**Start Rider Tracking**
```
/app/rider-location.start
Body: orderId
```

#### Restaurant WebSocket

**Connect**
```
ws://localhost:8083/ws
```

**Subscribe to New Orders**
```
/topic/restaurant/{restaurantEmail}
```

#### Rider WebSocket

**Connect**
```
ws://localhost:8080/ws
```

**Subscribe to New Delivery Requests**
```
/topic/rider/{riderEmail}
```

**Publish Location Update**
```
/app/location
Body: { email, current_lat, current_lng }
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Contribution Guidelines

1. **Fork the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/yumy.git
cd yumy
```

2. **Create a Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make Your Changes**
   - Follow existing code style
   - Write meaningful commit messages
   - Add tests for new features
   - Update documentation

4. **Commit Your Changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

**Commit Message Convention**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

5. **Push to Your Fork**
```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request**
   - Provide clear description
   - Reference related issues
   - Wait for review

### Code Style

- **Java**: Follow Spring Boot best practices
- **React**: Use functional components and hooks
- **File Naming**: 
  - Java: PascalCase for classes
  - React: PascalCase for components
  - JavaScript: camelCase for files
- **Indentation**: 4 spaces (Java), 2 spaces (JavaScript)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Yumy Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact

For questions, support, or collaboration:

- **GitHub**: [Your GitHub Profile](https://github.com/yourusername/yumy)
- **Email**: your.email@example.com

---

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot) - Java application framework
- [React](https://reactjs.org/) - Frontend library
- [gRPC](https://grpc.io/) - High-performance RPC framework
- [Apache Kafka](https://kafka.apache.org/) - Event streaming platform
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Mapbox](https://www.mapbox.com/) - Maps and location services
- [Cloudinary](https://cloudinary.com/) - Image management
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Docker](https://www.docker.com/) - Containerization platform

---

## 📊 Project Status

| Aspect | Status |
|--------|--------|
| Backend Services | ✅ Production Ready |
| Frontend Clients | ✅ Production Ready |
| Real-Time Features | ✅ Implemented |
| Documentation | ✅ Complete |
| Docker Support | ✅ Available |

---

## 🔮 Future Enhancements

- [ ] Admin dashboard for platform management
- [ ] Push notifications (FCM/APNs)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Advanced analytics and reporting
- [ ] Restaurant loyalty programs
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Mobile apps (React Native)
- [ ] AI-powered restaurant recommendations
- [ ] Voice ordering integration
- [ ] Scheduled orders
- [ ] Group ordering feature

---

<div align="center">
  <p>Made with ❤️ by the Yumy Team</p>
  <p>© 2026 Yumy. All rights reserved.</p>
</div>
