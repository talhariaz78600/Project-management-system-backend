# Budget Milestone Management System

This document describes the Budget Milestone feature implementation for the Project Management System.

## Overview

The Budget Milestone system allows project managers to break down project budgets into manageable milestones with specific deliverables, pricing, and status tracking.

## Features

- Create, read, update, and delete budget milestones
- Track milestone status (Pending, In Progress, Completed, Cancelled)
- Associate milestones with specific projects
- Get budget summaries and analytics
- Filter milestones by status, project, or other criteria
- Validation and error handling

## Database Schema

### BudgetMilestone Model

```javascript
{
  milestoneName: String (required, max 100 chars),
  status: String (enum: Pending, In Progress, Completed, Cancelled),
  price: Number (required, min 0),
  projectId: ObjectId (required, ref: Project),
  description: String (optional, max 500 chars),
  dueDate: Date (optional),
  completedDate: Date (auto-set when status = Completed),
  createdBy: ObjectId (ref: User),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## API Endpoints

### Base URL: `/api/budget-milestones`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all milestones with filtering/pagination | ✅ |
| POST | `/` | Create new milestone | ✅ Admin/Manager |
| GET | `/:id` | Get milestone by ID | ✅ |
| PATCH | `/:id` | Update milestone | ✅ Admin/Manager |
| DELETE | `/:id` | Delete milestone | ✅ Admin/Manager |
| PATCH | `/:id/status` | Update milestone status | ✅ Admin/Manager |
| GET | `/project/:projectId` | Get milestones by project | ✅ |
| GET | `/project/:projectId/summary` | Get budget summary for project | ✅ |
| GET | `/project/:projectId/status/:status` | Get milestones by project and status | ✅ |

## API Usage Examples

### 1. Create a Budget Milestone

```javascript
POST /api/budget-milestones
{
  "milestoneName": "Backend Development Phase 1",
  "status": "Pending",
  "price": 5000,
  "projectId": "507f1f77bcf86cd799439011",
  "description": "API development and database setup",
  "dueDate": "2025-02-15T00:00:00.000Z"
}
```

### 2. Get All Milestones with Filtering

```javascript
GET /api/budget-milestones?status=Pending&sort=-createdAt&limit=10&page=1
```

### 3. Update Milestone Status

```javascript
PATCH /api/budget-milestones/507f1f77bcf86cd799439012/status
{
  "status": "Completed"
}
```

### 4. Get Budget Summary for Project

```javascript
GET /api/budget-milestones/project/507f1f77bcf86cd799439011/summary

Response:
{
  "status": "success",
  "data": {
    "projectId": "507f1f77bcf86cd799439011",
    "totalBudget": 25000,
    "completedBudget": 8000,
    "pendingBudget": 17000,
    "milestoneCount": 5
  }
}
```

### 5. Get Milestones by Project

```javascript
GET /api/budget-milestones/project/507f1f77bcf86cd799439011?sort=dueDate&status=Pending
```

## Query Parameters

### Filtering
- `status`: Filter by milestone status
- `projectId`: Filter by project ID
- `milestoneName`: Filter by milestone name

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Sorting
- `sort`: Sort field (createdAt, -createdAt, price, -price, milestoneName, -milestoneName, status, -status)

### Field Selection
- `fields`: Comma-separated list of fields to include

## Validation Rules

### Create/Update Milestone
- `milestoneName`: Required, 1-100 characters
- `status`: Must be one of: Pending, In Progress, Completed, Cancelled
- `price`: Required, must be >= 0
- `projectId`: Required, valid MongoDB ObjectId
- `description`: Optional, max 500 characters
- `dueDate`: Optional, must be a valid date

## Error Responses

```javascript
// Validation Error
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "milestoneName",
      "message": "Milestone name is required"
    }
  ]
}

// Not Found
{
  "status": "error",
  "message": "Budget milestone not found"
}

// Unauthorized
{
  "status": "error",
  "message": "Access denied. Insufficient permissions."
}
```

## File Structure

```
src/
├── models/
│   └── BudgetMilestone.js          # Mongoose model
├── controllers/
│   └── budgetMilestoneController.js # Business logic
├── routes/
│   └── budgetMilestoneRoute.js     # API routes
├── utils/
│   ├── joi/
│   │   └── budgetMilestoneValidation.js # Validation schemas
│   └── seedBudgetMilestones.js     # Sample data seeding
└── config/
    └── routes.js                   # Route registration
```

## Testing

### Manual Testing
1. Use the test script: `node testBudgetMilestone.js`
2. Use Postman or similar API testing tool

### Sample Test Data
The system includes sample milestone data for testing:
- Project Planning Phase ($5,000)
- Design and Architecture ($8,000)
- Backend Development ($12,000)
- Frontend Development ($10,000)
- Testing and QA ($6,000)
- Deployment and Launch ($4,000)

## Integration with Existing System

The Budget Milestone system integrates with:
- **Project Model**: Each milestone is associated with a project
- **User Model**: Tracks who created each milestone
- **Authentication**: Uses existing auth middleware
- **Authorization**: Uses existing role-based access control
- **Validation**: Uses existing Joi validation pattern

## Business Logic Features

### Automatic Status Management
- When milestone status changes to "Completed", `completedDate` is automatically set
- `updatedAt` timestamp is maintained automatically

### Budget Analytics
- Calculate total project budget from all milestones
- Track completed vs pending budget amounts
- Generate budget summaries by project

### Performance Optimization
- Database indexes on commonly queried fields
- Pagination for large datasets
- Efficient aggregation queries for summaries

## Future Enhancements

1. **Payment Integration**: Connect with Stripe for milestone payments
2. **Notifications**: Send alerts for due dates and status changes
3. **Reporting**: Generate budget reports and charts
4. **File Attachments**: Allow document uploads per milestone
5. **Approval Workflow**: Multi-step approval process for milestone completion
6. **Time Tracking**: Track actual time spent vs estimated time

## Security Considerations

- All endpoints require authentication
- Role-based access control (Admin/Manager/SubAdmin)
- Input validation and sanitization
- MongoDB injection protection
- Rate limiting (if implemented)

## Deployment Notes

1. Ensure MongoDB connection is properly configured
2. Update environment variables if needed
3. Run database migrations if schema changes
4. Test all endpoints after deployment
5. Monitor error logs for any issues

## Support

For issues or questions regarding the Budget Milestone system, please:
1. Check this documentation first
2. Review error logs
3. Test with the provided test script
4. Contact the development team
