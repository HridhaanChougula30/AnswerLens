# AI Assessment Extraction & Answer Mapping

A production-ready AI-powered web application for teachers to upload question papers and student answer sheets, automatically extract questions, map student answers, and provide AI-generated grading and feedback.

## Features

### Core Functionality
- **Question Extraction**: Automatically extract all questions from a PDF or image, preserving original numbering including subparts (2(a), 2(b), etc.)
- **Answer Extraction**: Detect and transcribe handwritten answers from student answer sheets
- **Answer Mapping**: Intelligently map student answers to questions, handling out-of-order responses
- **Bounding Box Highlighting**: Precisely highlight answer regions on the answer sheet
- **AI Grading**: Get AI-generated evaluation scores, feedback, and missing concepts for each answer
- **Multi-page Support**: Handle answers and questions spanning multiple pages

### Teacher Experience
- Drag-and-drop file upload interface
- Split-screen assessment workspace
- Question list with filtering and search
- Answer sheet viewer with zoom and navigation
- Detailed question view with extracted student answers
- Assessment summary showing overall statistics
- Confidence indicators for uncertain mappings
- Manual correction capability for uncertain mappings

## Tech Stack

### Frontend
- **Next.js 15+** with App Router
- **React 19**
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Lucide React** for icons
- **Framer Motion** for animations

### Backend
- **Next.js API Routes** for server-side processing
- **Server Actions** for file uploads and processing

### AI & Document Processing
- **Google Gemini API** for multimodal document understanding
- **pdfjs-dist** for PDF rendering and page extraction
- **Sharp** for image optimization

### Validation & Type Safety
- **Zod** for runtime schema validation
- **TypeScript strict mode** for compile-time safety

## Architecture

### Processing Pipeline
```
Upload Files
    ↓
Extract Questions (Vision + OCR)
    ↓
Extract Handwritten Answers
    ↓
Map Answers to Questions (Semantic + Confidence)
    ↓
Generate AI Grading
    ↓
Display Results
```

### Key Components

#### Question Extraction
- Parses document structure using Gemini's vision capabilities
- Identifies question boundaries and numbering
- Treats labeled subparts as independent questions
- Returns normalized coordinates for precise highlighting

#### Answer Extraction
- Analyzes handwritten answer sheets
- Detects question numbers from handwriting
- Identifies answer boundaries
- Provides confidence scores for question number detection

#### Answer Mapping Engine
- Priority-based matching:
  1. Exact question number matching
  2. Semantic similarity analysis
  3. Contextual reasoning
- Handles answers in any order
- Flags uncertain mappings for review
- Confidence scoring system

#### AI Grading
- Evaluates answers for correctness and completeness
- Generates constructive feedback
- Identifies missing key concepts
- Estimates scores when applicable

## Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Google Gemini API key (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-assessment-extraction
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### POST `/api/analyze`
Analyzes uploaded question paper and answer sheet.

**Request (multipart/form-data):**
- `questionPaper`: File (PDF or image)
- `answerSheet`: File (PDF or image)

**Response:**
```json
{
  "success": true,
  "assessment": {
    "id": "assessment-id",
    "questions": [...],
    "answers": [...],
    "mappings": [...],
    "unmatchedAnswers": [...],
    "summary": {...}
  },
  "steps": [...]
}
```

## Data Models

### Question
```typescript
{
  id: string;
  number: string;           // "1", "2(a)", "3(ii)", etc
  text: string;
  page: number;
  bbox?: BoundingBox;       // Normalized coordinates
  type?: string;
  marks?: number;
  parentQuestion?: string;  // For subparts
}
```

### Answer
```typescript
{
  id: string;
  text: string;
  questionNumber?: string;  // Detected from handwriting
  page?: number;
  bbox?: BoundingBox;
  confidence?: number;      // 0-1 scale
  regions?: AnswerRegion[]; // For multi-page answers
}
```

### Mapping
```typescript
{
  questionId: string;
  questionNumber: string;
  answerId?: string;
  status: 'answered' | 'unanswered' | 'unmatched' | 'uncertain';
  confidence: number;       // 0-1, >= 0.85 is high confidence
  regions?: AnswerRegion[];
  grading?: Grading;
  manualCorrection?: boolean;
}
```

## Features in Detail

### Question Extraction
- Preserves exact original numbering
- Treats labeled subparts as independent questions
- Handles various numbering formats: 1, 2(a), 3(i), Q1, etc.
- Returns bounding boxes for precise highlighting

### Answer Out-of-Order Handling
The system correctly maps answers even when students write them in non-sequential order by:
- Detecting handwritten question labels
- Using semantic similarity of answer content
- Applying confidence scoring to flag uncertain mappings

### Multi-page Answer Support
Answers spanning multiple pages are represented as:
```typescript
{
  regions: [
    { page: 2, bbox: {...} },
    { page: 3, bbox: {...} }
  ]
}
```

### Confidence Scoring
- **≥ 0.85**: High confidence - no review needed
- **0.60-0.84**: Medium confidence - flagged for review
- **< 0.60**: Low confidence - manual intervention recommended

### Grading System
- Objective evaluation: correct/partially_correct/incorrect
- Constructive feedback generation
- Key concepts identification
- Missing elements highlighting

## Limitations

### Current
- Optimized for English language documents
- Works best with clear, legible handwriting
- PDF processing handled on client side for now
- Single student per assessment

### Known Edge Cases
- Extremely poor handwriting may reduce accuracy
- Non-standard question numbering may require manual correction
- Low-resolution scans can impact extraction accuracy
- Heavily annotated answer sheets may confuse the model

## Error Handling

The application handles:
- Invalid file formats with clear error messages
- Oversized files
- Corrupted PDFs
- Failed API calls with graceful degradation
- Malformed AI responses with validation
- Missing or unclear question numbers
- Unmapped answers

All errors display user-friendly messages without exposing technical details.

## Performance

### Optimizations
- Client-side PDF rendering with caching
- Lazy loading of answer sheet pages
- Efficient bounding box calculations
- Debounced search and filter operations
- Optimized image compression for API calls

### Typical Processing Times
- 1-2 pages: ~10-15 seconds
- 3-5 pages: ~20-30 seconds
- 6+ pages: ~40+ seconds

## Future Improvements

- Database persistence for assessment history
- Multi-student comparison
- Advanced analytics dashboard
- Better OCR through model fine-tuning
- Teacher correction learning
- Batch processing
- API key management in UI
- Partial grading with teacher overrides
- Export to LMS systems

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy

```bash
npm run build
```

### Self-Hosted

1. Build the application
2. Set environment variables
3. Run with `npm start`

Ensure GEMINI_API_KEY is set in production environment.

## Security

- API keys never exposed to client
- All AI processing happens server-side
- File uploads processed in memory (no disk persistence)
- Validated file types and sizes
- CSRF protection via Next.js
- XSS prevention through React's built-in escaping

## Testing

### Test Scenarios

1. **Same Order**: Questions and answers in matching order
2. **Out of Order**: Answers provided in different order
3. **Unanswered**: Some questions without answers
4. **Subparts**: Questions with labeled parts (2(a), 2(b))
5. **Multi-page**: Answers spanning multiple pages
6. **Unmatched**: Extra answers without matching questions
7. **Poor Handwriting**: Intentionally unclear handwriting
8. **Mixed Numbering**: Various numbering formats

## Troubleshooting

### API Key Issues
If you see "AI processing not configured":
1. Check `.env.local` has `GEMINI_API_KEY`
2. Verify API key is valid
3. Ensure sufficient quota on Gemini account

### Upload Failures
- Ensure file format is supported (PDF, PNG, JPG)
- Check file size < 50MB
- Verify file is not corrupted

### Extraction Issues
- Use high-resolution scans (200+ DPI)
- Ensure questions are clearly printed
- Ensure handwriting is reasonably legible

## Contributing

Contributions welcome! Areas for improvement:
- Better error messages
- Performance optimizations
- Additional language support
- Alternative AI providers
- Enhanced UI/UX

## License

MIT

## Support

For issues or questions:
1. Check troubleshooting section
2. Review existing issues
3. Create new issue with details

---

**Note**: This is a production-quality assessment tool designed for teachers. Always review AI-generated grading and feedback before sharing with students.
# AnswerLens
# AnswerLens
# AnswerLens
