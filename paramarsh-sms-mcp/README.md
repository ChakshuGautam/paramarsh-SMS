# Paramarsh SMS MCP Server

A Model Context Protocol (MCP) server that provides conversational access to Paramarsh SMS school management data. Query your student, teacher, attendance, invoice, and communication data using natural language.

## Features

- 🎯 **Natural Language Queries** - Ask questions in plain English
- 🔐 **Secure Authentication** - Uses your existing Clerk JWT tokens  
- 🏢 **Multi-Branch Support** - Query specific school branches
- 📊 **Smart Formatting** - Results formatted as readable tables
- ⚡ **Real-time Data** - Direct API integration with your SMS backend

## Installation

1. **Install dependencies:**
   ```bash
   cd paramarsh-sms-mcp
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API details
   ```

3. **Build the server:**
   ```bash
   npm run build
   ```

4. **Add to Claude Desktop config:**
   Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "paramarsh-sms": {
         "command": "node",
         "args": ["/path/to/paramarsh-SMS/paramarsh-sms-mcp/dist/index.js"]
       }
     }
   }
   ```

## Usage Examples

Once configured, you can ask Claude questions like:

### Students
- "Show me students in class 5A"
- "Find inactive students" 
- "Students named Rahul"
- "Recent student enrollments"

### Teachers  
- "List all math teachers"
- "Active teachers in science department"
- "Teachers sorted by name"

### Attendance
- "Today's attendance"
- "Absent students this week"
- "Attendance for class 5A yesterday"

### Invoices & Payments
- "Show overdue invoices"
- "Invoices over ₹5000"  
- "Payments received this month"
- "Outstanding dues"

### Communications
- "Messages sent today"
- "Active campaigns" 
- "Open support tickets"
- "Failed SMS deliveries"

### General/Stats
- "School overview"
- "Dashboard statistics"
- "Monthly summary"

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PARAMARSH_API_BASE` | SMS API base URL | `http://localhost:3001/api/admin` |
| `PARAMARSH_DEFAULT_BRANCH` | Default branch ID | `dps-main` |
| `PARAMARSH_AUTH_TOKEN` | Clerk JWT token | Required |
| `PARAMARSH_SCHOOL_ID` | School identifier | `dps` |

### Getting Your Auth Token

1. Open your SMS admin panel in browser
2. Open Developer Tools → Network tab
3. Make any API request
4. Copy the `Authorization: Bearer <token>` header value
5. Add to your `.env` file

## Query Mapping Logic

The MCP server maps natural language queries to specific API endpoints:

- **Keywords Detection** - Identifies intent from words like "overdue", "active", "today"
- **Parameter Extraction** - Pulls out class names, amounts, dates from queries  
- **Filter Building** - Constructs appropriate API filters and parameters
- **Multi-Call Support** - Can combine multiple API calls for comprehensive answers

## API Endpoints Used

- `/students` - Student data and enrollment information
- `/teachers` - Teacher profiles and assignments  
- `/attendance` - Attendance records and statistics
- `/invoices` - Invoice and billing information
- `/payments` - Payment records and transactions
- `/comms/messages` - SMS, email, and notification logs
- `/campaigns` - Communication campaign data
- `/tickets` - Support tickets and helpdesk

## Development

```bash
# Run in development mode
npm run dev

# Build for production  
npm run build

# Start production server
npm start
```

## Troubleshooting

**Connection Issues:**
- Verify `PARAMARSH_API_BASE` is correct and accessible
- Check that your auth token is valid and not expired
- Ensure the SMS backend is running

**Authentication Errors:**  
- Refresh your auth token from the browser
- Verify the token includes proper branch permissions
- Check that the branch ID exists in your system

**No Results:**
- Try broader queries first ("students", "teachers")  
- Check if data exists for your branch in the admin panel
- Verify branch ID spelling and format

## License

MIT License - see LICENSE file for details