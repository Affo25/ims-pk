# IMS Dashboard - Repository Information

## Project Overview
This is a Next.js 14 application for an Inventory Management System (IMS) dashboard built for PK operations.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Bootstrap 5 + Custom CSS
- **Authentication**: Custom session-based auth
- **Email**: Mandrill (MailChimp Transactional)
- **Deployment**: Vercel

## Project Structure
```
├── app/
│   ├── (main)/          # Protected routes
│   │   ├── sales/       # Sales management
│   │   ├── events/      # Event management
│   │   ├── marketing/   # Marketing campaigns
│   │   ├── accounts/    # Financial management
│   │   ├── development/ # Software development tracking
│   │   └── users/       # User management
│   ├── (others)/        # Public routes
│   │   ├── events-list/ # Public events listing
│   │   ├── proposals/   # Public proposals
│   │   └── signin/      # Authentication
│   └── api/             # API routes
├── components/          # Reusable React components
├── lib/                 # Utility libraries
│   ├── actions.js       # Server actions
│   ├── data.js          # Static data
│   ├── mongoose.js      # Database connection
│   └── utils.js         # Helper functions
├── models/              # MongoDB models
│   ├── User.js
│   ├── Event.js
│   ├── Inquiry.js
│   ├── Lead.js
│   ├── Proposal.js
│   └── Session.js
└── public/              # Static assets
```

## Key Features
1. **Sales Management**: Lead tracking, inquiry management, proposals
2. **Event Management**: Event planning, logistics, reporting
3. **Marketing**: Campaign management, email templates, client management
4. **Accounts**: Invoice management, payment tracking, target setting
5. **Development**: Software project tracking with Kanban boards
6. **User Management**: Role-based access control

## Database Models
- **User**: Staff members with roles (admin, manager, sales, etc.)
- **Session**: Authentication sessions
- **Lead**: Sales leads and prospects
- **Inquiry**: Customer inquiries and requests
- **Proposal**: Business proposals and quotes
- **Event**: Events, meetings, and activities

## Authentication
- Custom session-based authentication
- Role-based access control (admin, manager, sales, etc.)
- Session tokens stored in cookies and database

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `MANDRILL_KEY`: Mandrill API key for emails
- `NEXTAUTH_SECRET`: Session encryption secret

## Common Issues & Solutions
1. **Missing server actions**: Functions in `lib/actions.js` must be exported
2. **Database connection**: Ensure MongoDB URI is correctly configured
3. **Session management**: Sessions expire after 24 hours
4. **Public vs Protected routes**: Use `(others)` for public, `(main)` for protected

## Development Guidelines
1. All server actions go in `lib/actions.js`
2. Use MongoDB models from `models/` directory
3. Follow existing naming conventions
4. Include proper error handling and logging
5. Test both authenticated and public routes

## Deployment Notes
- Deploys on Vercel
- Uses `force-dynamic` for server-side rendering
- Requires proper environment variables setup
- Public routes should not require authentication