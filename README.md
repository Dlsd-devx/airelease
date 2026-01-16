# AI Release - Change Note Validator

A comprehensive web application for validating SimCorp Dimension change report notes against established rules and best practices.

## 🚀 Overview

This application helps engineers, product owners, and engineering managers validate change notes in JSON change report files against the rules defined in `change-notes.md`. It provides:

- **Automated Validation**: Check change notes against multiple rules
- **Batch Processing**: Validate multiple files at once
- **Detailed Reporting**: See exactly what issues exist and why
- **Rule Reference**: Built-in display of all validation rules
- **Beautiful UI**: Modern, responsive React interface

## 📋 Features

### Validation Rules

The application validates against these key rules:

1. **Mandatory Change Note**: Empty change notes are not allowed (as of 16.10.2024)
2. **Unknown Abbreviations**: Flags abbreviations not commonly known to customers
3. **Customer References**: Detects inappropriate customer name references
4. **Internal References**: Catches Agility/Siebel references not meant for customers
5. **Technical Details**: Warns about internal tool/process references
6. **Apply Note Repetition**: Ensures Customer Apply Notes don't just repeat Change Notes
7. **Missing Notes**: Identifies entries that might need exclusion from reports

### Severity Levels

- **Error**: Critical issues that violate mandatory rules
- **Warning**: Potential issues that should be reviewed
- **Info**: Informational notices about entries

## 🛠️ Tech Stack

- **Frontend**: React 18, Axios
- **Backend**: Node.js, Express
- **Deployment**: Docker, Docker Compose
- **Architecture**: Microservices (frontend + backend API)

## 🐳 Quick Start with Docker

### Prerequisites

- Docker installed and running
- Docker Compose installed

### Running the Application

1. **Clone the repository** (if not already done)

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3002 (port 3000 is used by Homepage)
   - Backend API: http://localhost:3001

4. **Stop the application**:
   ```bash
   docker-compose down
   ```

### First Build

The first time you run the application, Docker will build the images. This may take a few minutes:

```bash
# Build and start
docker-compose up --build

# Or build separately
docker-compose build
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 💻 Development Setup

### Backend Development

```bash
cd backend
npm install
npm run dev  # Starts with nodemon for auto-reload
```

Frontend runs on http://localhost:3002

### Frontend Development

```bash
cd frontend
npm install
npm start  # Starts on port 3002
```

Frontend runs on http://localhost:3002

## 📁 Project Structure

```
airelease/
├── backend/                 # Node.js/Express API
│   ├── validators/          # Validation logic
│   │   └── changeNoteValidator.js
│   ├── server.js            # Express server
│   ├── package.json
│   └── Dockerfile
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── FileList.js
│   │   │   ├── ValidationResults.js
│   │   │   └── RulesPanel.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   ├── nginx.conf           # Nginx config for production
│   └── Dockerfile
├── data/                    # Change report JSON files
│   └── subset/              # Sample subset of files
├── change-notes.md          # Rules and guidelines
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### File Management
- `GET /api/files` - List all JSON files
- `GET /api/files/subset` - List files in subset directory

### Validation
- `GET /api/validate/:filename?subset=true` - Validate a single file
- `POST /api/validate/all` - Validate multiple files
  ```json
  {
    "useSubset": true,
    "fileList": ["file1.json", "file2.json"]
  }
  ```

### Rules
- `GET /api/rules` - Get change note rules content

## 🎯 Usage Guide

### Validating a Single File

1. Select "Use Subset" toggle if working with sample data
2. Click on a file in the left sidebar
3. View validation results in the main area
4. Expand entries to see detailed violation information

### Validating All Files

1. Click "Validate All" button in the sidebar
2. Wait for batch processing to complete
3. Review summary statistics
4. Expand individual files to see their violations

### Understanding Results

**Summary Cards** show:
- Total Entries: Number of change note entries in the file(s)
- With Issues: How many entries have violations
- Errors/Warnings/Info: Count by severity

**Violation Details** include:
- Reference ID (D-xxxxx or S-xxxxx)
- Change Note text
- Specific rule violated
- Explanation of the issue
- Additional details (if applicable)

## 🔒 Security

- Files are mounted read-only in Docker
- Path traversal protection on file access
- No data modification capabilities
- CORS enabled for local development

## 🧪 Testing Validation Logic

Test files are available in `data/subset/` directory. These are real change reports that demonstrate various validation scenarios.

## 📊 Validation Statistics

The application tracks and displays:
- Total files processed
- Total entries validated
- Issues found by severity
- Per-file statistics
- Per-entry violation details

## 🚧 Troubleshooting

### Backend not connecting
```bash
docker-compose logs backend
# Check if backend is running on port 3001
curl http://localhost:3001/api/health
```

### Frontend not loading
```bash
docker-compose logs frontend
# Check Nginx status
```

### Permission issues with data directory
```bash
# Ensure data files are readable
chmod -R 755 data/
```

### Rebuild after code changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔄 Updating the Application

1. **Pull latest changes**
2. **Rebuild containers**:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

## 📝 Adding New Validation Rules

Edit `backend/validators/changeNoteValidator.js` and add your rule logic in the `validateEntry` function. Rules should return violation objects with:

```javascript
{
  severity: 'error' | 'warning' | 'info',
  rule: 'rule-identifier',
  field: 'ChangeNote' | 'CustomerApplyNote',
  message: 'Human-readable explanation',
  reference: 'D-12345',
  details: {} // Optional additional data
}
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add validation rules thoughtfully
3. Update documentation for new features
4. Test with sample data before committing

## 📄 License

Internal SimCorp Dimension tool - proprietary use only.

## 🙋 Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify data files are accessible
3. Ensure Docker has enough resources
4. Review validation rules in `change-notes.md`

---

**Built with ❤️ for better change note quality**
