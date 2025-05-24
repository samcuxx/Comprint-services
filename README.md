# Comprint Services Management System

An integrated management system for sales, inventory, and service operations at Comprint Services, Kumasi.

## Overview

This web application provides a centralized platform for managing employees, sales, inventory, and technical services. It replaces manual processes with an efficient digital workflow to improve productivity and customer satisfaction.

## Features

- **User Management**: Role-based access for admins, sales staff, and technicians
- **Sales Management**: Track sales transactions and customer details
- **Inventory Control**: Monitor stock levels and product availability
- **Service Management**: Assign and track technical service requests
- **Profile Management**: User profile administration and updates

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Authentication)
- **Deployment**: Vercel (recommended)

## User Roles

- **Admin**: Full access to manage employees and system operations
- **Sales**: Handle sales transactions and inventory
- **Technician**: Manage service requests and technical operations

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Create a Supabase project
2. Run the SQL schema in `schema.sql` to set up the database tables and policies

## Project Structure

```
├── app/                # Next.js app router
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard pages
├── components/         # React components
├── lib/                # Utility functions and types
├── hooks/              # Custom React hooks
└── public/             # Static assets
```

## License

This project is for educational purposes as part of a coursework for Dr. Eric Yaw Agbezugu's class.

---

Prepared by: Antwi Victor Obeng
