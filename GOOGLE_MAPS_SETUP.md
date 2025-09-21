# Google Maps Setup Guide for CivicSense

## Overview
The map view feature in CivicSense requires a Google Maps API key to display interactive maps with issue locations.

## Steps to Setup Google Maps API Key

### 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project (required for Maps API)

### 2. Enable Google Maps JavaScript API
1. Navigate to the "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"

### 3. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 4. Restrict API Key (Recommended)
1. Click on the API key you just created
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain (e.g., `https://yourdomain.com/*`)
   - For local development, add: `http://localhost:3000/*`
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Maps JavaScript API"

### 5. Update Environment Variable
1. Open `.env.local` file in your project root
2. Replace `your_google_maps_api_key_here` with your actual API key:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYourActualAPIKeyHere
   ```

### 6. Restart Development Server
```bash
npm run dev
```

## Map View Features

### 1. Interactive Map Display
- Shows all issues with location data as markers
- Color-coded markers based on issue status:
  - 🔵 Blue: Submitted
  - 🟡 Yellow: Acknowledged  
  - 🟣 Purple: In Progress
  - 🟢 Green: Resolved
  - 🔘 Gray: Closed

### 2. Priority-Based Marker Sizing
- Larger markers indicate higher priority issues
- Urgent issues have the largest markers

### 3. User Location Integration
- Shows user's current location on the map
- Automatically centers map on user location
- Works with location-based filtering

### 4. Interactive Issue Details
- Click on any marker to view issue details
- Quick access to voting buttons
- Direct links to detailed issue view

### 5. Location Filtering
- Toggle to show only nearby issues
- Adjustable radius slider (1-50km)
- Real-time filtering based on user location

## Map View Access

### From Issue Tracker
1. Navigate to the Issues page
2. Use the "Map View" tab to switch from list to map
3. All location filtering controls work in both views

### Map Controls
- **Zoom**: Use mouse wheel or +/- buttons
- **Pan**: Click and drag to move around
- **Markers**: Click to view issue details
- **User Location**: Blue dot with white center
- **Issue Markers**: Color-coded circles with exclamation marks

## Troubleshooting

### Map Not Loading
1. Check if Google Maps API key is correctly set
2. Verify the API key has Maps JavaScript API enabled
3. Check browser console for error messages
4. Ensure billing is enabled for your Google Cloud project

### Location Not Working
1. Allow location access when prompted by browser
2. Check if HTTPS is enabled (required for geolocation)
3. Verify location services are enabled on device

### Issues Not Showing on Map
1. Ensure issues have latitude/longitude data
2. Check if location filtering is too restrictive
3. Verify issues are within the selected radius

## Cost Considerations

### Google Maps Pricing
- Google Maps JavaScript API has a monthly free tier
- First 28,000 map loads per month are free
- Additional usage is charged per 1,000 map loads
- Monitor usage in Google Cloud Console

### Optimization Tips
1. Implement map lazy loading
2. Use marker clustering for dense areas
3. Limit concurrent map instances
4. Cache map data when possible

## Security Best Practices

### API Key Security
1. Always restrict API keys to specific domains
2. Never commit API keys to public repositories
3. Use environment variables for API keys
4. Regularly rotate API keys
5. Monitor API key usage for suspicious activity

### Data Privacy
1. Only collect location data with user consent
2. Allow users to opt-out of location services
3. Implement location data retention policies
4. Secure location data transmission with HTTPS

## Development Notes

### Map Component Structure
```
src/components/maps/
├── MapView.tsx           # Main map component
├── IssueMarker.tsx      # Individual issue markers (future)
└── MapControls.tsx      # Map controls (future)
```

### Integration Points
- `IssueTracker.tsx`: Main integration with tabs
- `useLocation.ts`: Location services hook
- `database.ts`: Location-based issue queries
- Environment: Google Maps API key configuration