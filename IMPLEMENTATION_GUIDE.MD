# Albanian Voice Translator - Implementation Guide

## Current Project Structure
```
translator/
├── src/
│   ├── components/
│   │   ├── CallInterface.js
│   │   ├── TranslationApp.js
│   │   ├── VoiceTest.js
│   │   ├── PricingPlans.js ✓
│   │   ├── SubscriptionModal.js ✓
│   │   ├── SuccessPage.js ✓
│   │   └── CancelPage.js ✓
│   ├── services/
│   │   ├── CallService.js
│   │   ├── ElevenLabsService.js
│   │   ├── TranslationService.js
│   │   ├── WebRTCService.js
│   │   ├── PaymentService.js ✓
│   │   └── SocketService.js ✓
│   ├── routes/
│   │   └── stripeRoutes.js ✓
│   ├── theme/
│   │   ├── index.js
│   │   ├── components.js
│   │   └── premium.js
│   ├── App.js
│   └── index.js
├── public/
├── server.js
└── package.json
```

## Premium UI Implementation
1. Dashboard Layout:
```javascript
// src/components/Dashboard.js
const Dashboard = {
  components: {
    Header: {
      height: '80px',
      background: 'linear-gradient',
      premium: {
        glassmorphism: true,
        animations: true
      }
    },
    Sidebar: {
      features: ['navigation', 'settings', 'analytics'],
      conditional: {
        tier: 'business-elite',
        features: ['custom-terms', 'white-label']
      }
    },
    MainContent: {
      layout: 'responsive-grid',
      sections: ['call-interface', 'analytics', 'settings']
    }
  },
  themes: {
    light: premiumLightTheme,
    dark: premiumDarkTheme,
    custom: businessEliteTheme
  }
}
```

2. Quality Controls:
```javascript
// src/components/QualityControls.js
const QualityControls = {
  audio: {
    basic: {
      sampleRate: 44100,
      bitDepth: 16
    },
    premium: {
      sampleRate: 48000,
      bitDepth: 24,
      noiseCancellation: true
    },
    elite: {
      sampleRate: 96000,
      bitDepth: 32,
      noiseCancellation: true,
      echoCancellation: true
    }
  }
}
```

## Implementation Steps

### 1. Server Setup (Completed ✓)
1. Update server.js:
```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8
});

// Room management
const rooms = new Map();

io.on('connection', (socket) => {
  // Room handling
  socket.on('create-room', (roomId) => {
    rooms.set(roomId, { initiator: socket.id });
    socket.join(roomId);
  });

  // Audio streaming
  socket.on('audio-stream', (data) => {
    const { roomId, audio, language } = data;
    socket.to(roomId).emit('audio-stream', { audio, language });
  });

  // Connection management
  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.initiator === socket.id) {
        rooms.delete(roomId);
        io.to(roomId).emit('room-closed');
      }
    }
  });
});

server.listen(3001, () => console.log('Server running on port 3001'));
```

### 2. Audio Processing Service (Completed ✓)
1. Create new file src/services/AudioService.js:
```javascript
class AudioService {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.processor = null;
    this.stream = null;
  }

  async initializeStream() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    return this.stream;
  }

  startProcessing(onAudioData) {
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      onAudioData(inputData);
    };
  }

  stopProcessing() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

export default new AudioService();
```

### 3. Update Translation Service (Completed ✓)
1. Modify src/services/TranslationService.js:
```javascript
import axios from 'axios';
import ElevenLabsService from './ElevenLabsService';

class TranslationService {
  constructor() {
    this.googleApiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
    this.currentLanguage = 'sq-AL';
    this.onTranslation = null;
    this.onError = null;
  }

  async translateText(text, fromLang, toLang) {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${this.googleApiKey}`,
        {
          q: text,
          source: fromLang,
          target: toLang,
          format: 'text'
        }
      );
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  async processAudioStream(audioData, fromLang, toLang) {
    try {
      // Convert audio to text
      const text = await this.speechToText(audioData);
      
      // Translate text
      const translated = await this.translateText(text, fromLang, toLang);
      
      // Convert to speech
      await ElevenLabsService.textToSpeech(translated);
      
      return { original: text, translated };
    } catch (error) {
      throw new Error(`Audio processing failed: ${error.message}`);
    }
  }
}

export default new TranslationService();
```

### 4. Socket.IO Integration (Completed ✓)

### 5. Premium Feature Implementation
1. Voice Quality Tiers:
```javascript
// src/services/AudioQualityService.js
class AudioQualityService {
  constructor(tier) {
    this.config = QualityConfigs[tier];
    this.processor = null;
  }

  async initializeStream(quality) {
    const constraints = {
      audio: {
        sampleRate: this.config.sampleRate,
        channelCount: quality === 'premium' ? 2 : 1,
        echoCancellation: this.config.echoCancellation,
        noiseSuppression: this.config.noiseCancellation
      }
    };
    // Implementation details...
  }
}
```

2. Custom Terminology:
```javascript
// src/services/TerminologyService.js
class TerminologyService {
  constructor() {
    this.customTerms = new Map();
    this.industryTerms = new Map();
  }

  addCustomTerm(source, target, context) {
    // Implementation details...
  }

  applyTerminology(text, industry) {
    // Implementation details...
  }
}
```

3. Analytics Dashboard:
```javascript
// src/components/Analytics.js
const Analytics = {
  metrics: {
    basic: ['usage', 'calls'],
    premium: ['quality', 'performance', 'trends'],
    elite: ['custom-reports', 'api-usage', 'team-stats']
  },
  visualizations: {
    charts: ['usage-over-time', 'quality-metrics'],
    reports: ['monthly-summary', 'team-performance'],
    exports: ['csv', 'pdf', 'api']
  }
}
```

### 6. UI/UX Premium Elements
1. Component Hierarchy:
```
PremiumApp
├── Dashboard
│   ├── Header
│   │   ├── QualityIndicator
│   │   ├── TierBadge
│   │   └── UserMenu
│   ├── Sidebar
│   │   ├── Navigation
│   │   └── FeatureControls
│   └── MainContent
│       ├── CallInterface
│       ├── Analytics
│       └── Settings
└── Footer
```

2. Premium Styling:
```scss
// src/styles/premium.scss
.premium-container {
  background: var(--premium-gradient);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &.business-elite {
    box-shadow: var(--elite-shadow);
    animation: premium-pulse 2s infinite;
  }
}

.quality-indicator {
  &.premium {
    background: linear-gradient(45deg, #00A3FF, #00FF94);
  }
  
  &.elite {
    background: linear-gradient(45deg, #7B61FF, #00FF94);
  }
}
```

3. Responsive Design:
```javascript
// src/theme/breakpoints.js
export const breakpoints = {
  base: '0px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  custom: '1920px' // For ultra-wide business displays
};
```
1. Create src/services/SocketService.js:
```javascript
import io from 'socket.io-client';
import AudioService from './AudioService';
import TranslationService from './TranslationService';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.isConnected = false;
  }

  connect() {
    this.socket = io('http://localhost:3001');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      this.isConnected = true;
    });

    this.socket.on('audio-stream', async (data) => {
      const { audio, language } = data;
      await this.handleIncomingAudio(audio, language);
    });
  }

  async createRoom() {
    this.roomId = `room_${Date.now()}`;
    this.socket.emit('create-room', this.roomId);
    return this.roomId;
  }

  async joinRoom(roomId) {
    this.roomId = roomId;
    this.socket.emit('join-room', roomId);
  }

  async startStreaming() {
    await AudioService.initializeStream();
    AudioService.startProcessing((audioData) => {
      if (this.roomId) {
        this.socket.emit('audio-stream', {
          roomId: this.roomId,
          audio: audioData,
          language: TranslationService.currentLanguage
        });
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    AudioService.stopProcessing();
    this.roomId = null;
    this.isConnected = false;
  }
}

export default new SocketService();
```

### 7. Quality Assurance
1. Premium Feature Testing:
```javascript
// src/tests/premium.test.js
describe('Premium Features', () => {
  test('Voice Quality Tiers', async () => {
    // Test different quality settings
  });

  test('Custom Terminology', () => {
    // Test terminology management
  });

  test('Analytics Dashboard', () => {
    // Test data visualization
  });
});
```

2. Performance Benchmarks:
```javascript
// src/tests/performance.test.js
describe('Performance Tests', () => {
  test('Translation Latency', async () => {
    // Should be under 2 seconds
  });

  test('Audio Quality', () => {
    // Should meet tier specifications
  });

  test('Concurrent Users', () => {
    // Should handle multiple connections
  });
});
```
1. Modify CallInterface.js to use SocketService instead of WebRTC
2. Update TranslationApp.js with new controls and status indicators
3. Add error handling and connection status displays

### 8. Environment Setup (Completed ✓)
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Add your API keys to `.env` (NEVER commit this file)
4. Install dependencies
5. Start development server

### 9. Testing Process
1. Start servers:
```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend
npm start
```

2. Test flow:
- Open two browser windows
- Start call in first window
- Join with room code in second window
- Test bidirectional translation
- Verify audio quality and latency

### 10. Optimization Steps
1. Audio Processing:
- Implement audio compression
- Add noise reduction
- Optimize packet size

2. Translation Pipeline:
- Add caching for common phrases
- Implement batch processing
- Add retry mechanisms

3. Error Handling:
- Add reconnection logic
- Implement fallback options
- Add user feedback mechanisms

### 11. Deployment Preparation
1. Backend:
```bash
# Install PM2 for process management
npm install -g pm2
pm2 start server.js
```

2. Frontend:
```bash
npm run build
```

3. SSL Setup:
- Obtain SSL certificate
- Configure HTTPS
- Update WebSocket to WSS

### 12. Monitoring Implementation

1. Usage Tracking:
```javascript
// src/services/MonitoringService.js
class MonitoringService {
  constructor(tier) {
    this.limits = TierLimits[tier];
    this.metrics = new MetricsCollector();
  }

  trackUsage(type, amount) {
    // Implementation details...
  }

  generateReport() {
    // Implementation details...
  }
}
```

2. Quality Monitoring:
```javascript
// src/services/QualityMonitor.js
class QualityMonitor {
  constructor() {
    this.metrics = {
      latency: [],
      audioQuality: [],
      translationAccuracy: []
    };
  }

  measureLatency() {
    // Implementation details...
  }

  assessQuality() {
    // Implementation details...
  }
}
```
1. Add performance monitoring:
- Translation latency
- Audio quality metrics
- Connection stability

2. Usage tracking:
- API call counts
- Credit consumption
- User session data

### Next Steps
1. Complete Socket.IO implementation
2. Test audio streaming
3. Optimize translation pipeline
4. Deploy and monitor

### Common Issues & Solutions
1. Audio Streaming:
- Issue: High latency
- Solution: Optimize packet size and compression

2. Connection Handling:
- Issue: Disconnections
- Solution: Implement automatic reconnection

3. Translation:
- Issue: Accuracy
- Solution: Add context awareness and caching

## Recent Updates
- Implemented security improvements for API key management
- Added `.env` to `.gitignore`
- Created `.env.example` template
- Cleaned git history of sensitive data
- Updated README with security warnings

## Security Guidelines
- Never commit API keys or sensitive data
- Always use environment variables for secrets
- Keep `.env` file local and secure
- Use `.env.example` for required variable templates
- Regular security audits required

## Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## Next Steps
1. Complete payment system integration
2. Prepare for beta launch
3. Set up monitoring systems
4. Document API endpoints

## Testing
- Unit tests for core functions
- Integration tests for API calls
- End-to-end testing
- Security testing

## Deployment
- Configure production environment
- Set up CI/CD pipeline
- Monitor system health
- Regular backups

## Maintenance
- Regular security updates
- Performance optimization
- Bug fixes
- Feature updates

This guide will be updated as the project evolves.
