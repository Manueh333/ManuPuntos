# ManuPuntos - Multi-User Point Tracker Web Application

A simple and intuitive web application for tracking different types of points with reasons and visualizing progress over time. Supports multiple users with individual tracking and shared statistics viewing.

## Features

- **Three Types of Points**:
  - Positive points (+1 to total)
  - Neutral points (no change to total)
  - Negative points (-1 to total)

- **Point Management**:
  - Add individual points with reasons
  - Bulk add multiple points at once
  - Required reason field for all entries

- **Visualization**:
  - Interactive progress chart showing score evolution
  - Hover over chart points to see corresponding reasons
  - Real-time score display with animations

- **Data Persistence**:
  - All data saved locally using localStorage
  - Persists across browser sessions and page reloads
  - Cloud sync capability for universal access across devices
  - No server required for basic functionality

- **Multi-User Support**:
  - Add multiple users to the system
  - Switch between users easily
  - Individual point tracking per user
  - Shared statistics view for all users

- **History Tracking**:
  - View recent entries with timestamps
  - Clear history functionality (per user)
  - Detailed entry information

## Getting Started

1. **No Installation Required**: This is a static web application that runs entirely in your browser.

2. **Open the App**: Simply open `index.html` in your web browser.

3. **Start Tracking**: 
   - Select or add a user from the dropdown
   - Enter a reason in the text area
   - Click one of the three point buttons (+1, Neutral, -1)
   - Or use the bulk add feature for multiple points

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and responsive design
- `script.js` - Application logic and functionality
- `README.md` - This documentation

## Usage

### Adding Single Points
1. Enter a reason in the text area
2. Click the appropriate button:
   - **+1 Point**: Adds 1 to your total score
   - **Neutral Point**: Records the entry but doesn't change score
   - **-1 Point**: Subtracts 1 from your total score

### Adding Bulk Points
1. Enter a reason in the text area
2. Enter the quantity of points to add
3. Select the type (Positive, Neutral, or Negative)
4. Click "Add Bulk Points"

### Viewing Progress
- The current score is displayed prominently at the top
- The progress chart shows your score evolution over time
- Hover over chart points to see the reason for each entry
- Recent entries are shown in the history section

### User Management
1. **Add New User**: Click "Add User" button and enter a name
2. **Switch Users**: Use the dropdown to select different users
3. **View All Stats**: All users' statistics are visible to everyone
4. **Individual Tracking**: Each user has their own points and history

### Managing Data
- All data is automatically saved locally
- Use "Clear All History" to reset current user's data (requires password)
- Data persists even if you close and reopen the browser

### Cloud Sync (Optional)
1. Click "Enable Cloud Sync" to sync data across devices
2. Share your sync key with other devices to access the same data
3. Your points will be universal across all synchronized devices
4. Use "Disable Cloud Sync" to turn off synchronization

### Security
- History clearing is protected with password: `ManuPuntos2025`
- Cloud sync uses unique keys for data privacy
- All data is encrypted when synced to cloud storage

## Technical Details

- **Framework**: Vanilla JavaScript (no dependencies except Chart.js)
- **Chart Library**: Chart.js for interactive visualizations
- **Storage**: localStorage for data persistence
- **Responsive**: Works on desktop and mobile devices
- **Offline**: Fully functional without internet connection

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Deployment

### GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings > Pages
4. Select "Deploy from a branch" and choose `main` branch
5. Your app will be available at `https://yourusername.github.io/repository-name`

### Other Static Hosting
1. Upload all files to your web server
2. No server-side processing required
3. Can be hosted on Netlify, Vercel, etc.

### Local Development
1. Clone the repository
2. Open `index.html` in your browser
3. No build process required

## Customization

The application can be easily customized by modifying:
- Colors and styling in `style.css`
- Point values and types in `script.js`
- Layout and structure in `index.html`

## License

This project is open source and available under the MIT License.
