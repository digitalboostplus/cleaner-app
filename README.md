# Photo Cleaner App

A comprehensive photo storage cleanup application that helps users efficiently manage and clean their photo libraries by removing duplicates, similar photos, and unwanted images.

## Features

### 🔍 AI-Powered Duplicate Detection
- Advanced algorithms detect exact duplicates and visually similar photos
- Perceptual hashing for finding similar images with different file sizes
- Smart photo quality assessment based on focus, composition, and metadata

### 📱 Intuitive User Interface
- **Upload Interface**: Drag & drop, file selection, device access, and clipboard paste
- **Grid View**: Organize photos with batch selection and duplicate grouping
- **Swipe Interface**: Tinder-like swipe gestures (left to delete, right to keep)
- **Comparison View**: Side-by-side photo comparison for duplicate groups
- **Stats Panel**: Real-time analytics and cleanup progress tracking

### 🖥️ Multi-Platform Storage Support
- Local file upload with drag & drop
- Direct device photo library access (File System Access API)
- Clipboard integration for quick photo import
- Expandable for cloud storage APIs (Google Photos, iCloud, etc.)

### 📊 Smart Organization
- Automatic categorization by date, location, and file size
- Duplicate grouping with similarity scoring
- Storage optimization recommendations
- Progress tracking and completion statistics

### 🔐 Privacy-First Design
- All processing happens locally in the browser
- No photos are uploaded to external servers
- Secure handling of sensitive photos
- Optional secure folder for private images

## Technology Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **Image Processing**: Canvas API for perceptual hashing
- **TypeScript**: Full type safety and better developer experience
- **Icons**: Lucide React for consistent iconography

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with File System Access API support (Chrome 86+, Edge 86+)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd photo-cleaner-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

### 1. Upload Photos
- **Drag & Drop**: Drop image files directly onto the upload area
- **File Selection**: Click to open file picker dialog
- **Device Access**: Access photos directly from your device (requires permission)
- **Clipboard**: Paste copied images instantly

### 2. Organize and Review
- **Grid View**: See all photos with duplicate indicators
- **Duplicates Tab**: View grouped duplicates with similarity scores
- **Batch Operations**: Select multiple photos for deletion

### 3. Clean with Swipe Interface
- Swipe left to delete unwanted photos
- Swipe right to keep photos
- Use navigation buttons for precise control
- Undo recent deletions

### 4. Compare Similar Photos
- Click "Compare" on duplicate groups
- View photos side-by-side with metadata
- Make informed decisions about which to keep
- See similarity scores and file information

### 5. Track Progress
- **Stats Panel**: Monitor cleanup progress
- **Storage Analytics**: See space freed and optimization tips
- **Activity Feed**: Review recent cleanup actions

## API Reference

### Core Classes

#### `ImageHasher`
Handles perceptual hashing and similarity detection:
```typescript
const hasher = new ImageHasher()
const hash = await hasher.generateHash(photo)
const similarity = hasher.calculateSimilarity(hash1, hash2)
```

#### `DevicePhotoManager`
Manages device photo library access:
```typescript
const manager = new DevicePhotoManager()
const hasAccess = await manager.requestPhotoLibraryAccess()
const photos = await manager.loadPhotosFromDevice()
```

### Key Functions

#### `findDuplicates(photos: Photo[])`
Finds exact duplicates based on file size and name similarity.

#### `findSimilarPhotos(photos: Photo[], threshold: number)`
Uses perceptual hashing to find visually similar photos.

#### `loadPhotosFromClipboard()`
Extracts photos from clipboard data.

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Basic Upload | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ | ✅ | ✅ |
| Device Access | ✅ 86+ | ✅ 86+ | ❌ | ❌ |
| Clipboard API | ✅ 76+ | ✅ 79+ | ✅ 127+ | ✅ 13.1+ |
| Canvas API | ✅ | ✅ | ✅ | ✅ |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Considerations

- **Memory Usage**: Large photo libraries may consume significant memory
- **Processing Time**: Perceptual hashing scales with photo count
- **Browser Limits**: File System Access API has security restrictions
- **Optimization**: Uses Web Workers for heavy processing (future enhancement)

## Security

- All photo processing occurs client-side
- No external API calls for photo analysis
- File System Access API requires explicit user permission
- Clipboard access follows browser security policies

## Future Enhancements

- [ ] Cloud storage integration (Google Photos, iCloud)
- [ ] Web Workers for background processing
- [ ] Batch export functionality
- [ ] Advanced filtering options
- [ ] Photo editing capabilities
- [ ] Machine learning for content-based organization

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by popular mobile photo cleanup apps
- Built with modern web technologies
- Designed with privacy and user experience in mind