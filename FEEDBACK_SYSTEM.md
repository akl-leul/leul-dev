# Project Feedback System

A comprehensive feedback system for managing project feedback with admin controls and public display.

## Features

### 🎯 **Public Feedback Submission**
- **Star Rating System**: 1-5 star rating for projects
- **Rich Text Feedback**: Detailed feedback with character validation
- **User Information**: Optional name and email collection
- **Authentication Support**: Pre-fills user data for authenticated users
- **Real-time Validation**: Form validation with helpful error messages

### 🔧 **Admin Management**
- **Comprehensive Dashboard**: View all feedback with filtering and search
- **Approval System**: Approve/reject feedback before public display
- **Response Management**: Respond to feedback with admin messages
- **Bulk Operations**: Delete multiple feedback entries
- **Project Filtering**: Filter feedback by specific projects
- **Status Filtering**: Filter by approval status (pending/approved)

### 📊 **Public Display**
- **Approved Feedback Only**: Only approved feedback is shown publicly
- **Rating Display**: Visual star ratings with average calculations
- **Response Integration**: Admin responses displayed with original feedback
- **Project Integration**: Feedback embedded in project detail pages
- **Widget Support**: Compact feedback widgets for various contexts

## Components

### Core Components

#### `ProjectFeedback`
Main feedback component for project detail pages
```tsx
<ProjectFeedback 
  projectId="project-uuid" 
  projectTitle="Project Name"
  showForm={true}
  showFeedbacks={true}
/>
```

#### `FeedbackWidget`
Compact feedback widget for embedding anywhere
```tsx
<FeedbackWidget 
  projectId="project-uuid" 
  projectTitle="Project Name"
  compact={true}
  showLatest={true}
  maxLatest={3}
/>
```

#### `AdminFeedbackManager`
Complete admin interface for feedback management
```tsx
<AdminFeedbackManager />
```

#### `FeaturedProjectsWithFeedback`
Homepage component showing projects with feedback summaries
```tsx
<FeaturedProjectsWithFeedback />
```

### Database Schema

The system uses the `project_feedbacks` table with the following structure:

```sql
CREATE TABLE project_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NULL, -- optional authenticated user
  author_name TEXT NOT NULL,
  author_email TEXT NULL,
  rating SMALLINT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ NULL,
  approved_by UUID NULL,
  response_message TEXT NULL,
  responded_at TIMESTAMPTZ NULL,
  responded_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Row Level Security (RLS)

The system implements comprehensive RLS policies:

- **Public Submission**: Anyone can submit feedback
- **Public Viewing**: Only approved feedback is visible to public
- **Author Access**: Feedback authors can view/edit their own unapproved feedback
- **Admin Access**: Admins can manage all feedback through admin roles

## Usage Examples

### Adding Feedback to Project Pages

```tsx
// In ProjectDetail.tsx
import { ProjectFeedback } from "@/components/ProjectFeedback";

export default function ProjectDetail() {
  return (
    <div>
      {/* Project content */}
      <ProjectFeedback 
        projectId={project.id} 
        projectTitle={project.title}
      />
    </div>
  );
}
```

### Adding Compact Feedback Widget

```tsx
// In any component
import { FeedbackWidget } from "@/components/FeedbackWidget";

export default function ProjectCard({ project }) {
  return (
    <Card>
      {/* Project info */}
      <FeedbackWidget 
        projectId={project.id} 
        projectTitle={project.title}
        compact={true}
        showLatest={true}
        maxLatest={2}
      />
    </Card>
  );
}
```

### Admin Integration

```tsx
// In Admin.tsx
import { AdminFeedbackManager } from "@/components/admin/AdminFeedbackManager";

export default function Admin() {
  return (
    <div>
      {activeTab === "feedback" && <AdminFeedbackManager />}
    </div>
  );
}
```

## API Integration

### Supabase Queries

#### Fetch Approved Feedback
```typescript
const { data, error } = await supabase
  .from("project_feedbacks")
  .select("*")
  .eq("project_id", projectId)
  .eq("approved", true)
  .order("created_at", { ascending: false });
```

#### Submit New Feedback
```typescript
const { error } = await supabase
  .from("project_feedbacks")
  .insert({
    project_id: projectId,
    user_id: user?.id || null,
    author_name: data.author_name,
    author_email: data.author_email || null,
    rating: selectedRating,
    content: data.content,
  });
```

#### Admin Operations
```typescript
// Approve feedback
await supabase
  .from("project_feedbacks")
  .update({
    approved: true,
    approved_at: new Date().toISOString(),
    approved_by: adminUserId,
  })
  .eq("id", feedbackId);

// Add response
await supabase
  .from("project_feedbacks")
  .update({
    response_message: responseText,
    responded_at: new Date().toISOString(),
    responded_by: adminUserId,
  })
  .eq("id", feedbackId);
```

## Styling

The components use Tailwind CSS with shadcn/ui components:

- **Cards**: For feedback containers and forms
- **Badges**: For status indicators and ratings
- **Buttons**: For actions and form submission
- **Input/Textarea**: For form fields
- **Dialog**: For admin response modals
- **Icons**: Lucide React icons for visual elements

## Security Features

1. **Input Validation**: Zod schema validation for all form inputs
2. **SQL Injection Protection**: Supabase handles parameterized queries
3. **RLS Policies**: Database-level access control
4. **Admin Authentication**: Admin-only access to management features
5. **Content Moderation**: Approval system prevents spam/abuse

## Performance Optimizations

1. **Lazy Loading**: Feedback loaded only when needed
2. **Pagination**: Large feedback lists are paginated
3. **Caching**: Supabase handles query caching
4. **Optimistic Updates**: UI updates immediately for better UX
5. **Debounced Search**: Search input is debounced to reduce API calls

## Future Enhancements

- **Email Notifications**: Notify admins of new feedback
- **Feedback Analytics**: Charts and statistics for feedback trends
- **Bulk Import/Export**: CSV import/export for feedback data
- **Advanced Filtering**: Date ranges, rating filters, etc.
- **Feedback Categories**: Categorize feedback by type (bug, feature, etc.)
- **Moderation Queue**: Dedicated interface for pending feedback review
