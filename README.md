# Albanian Translator

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.10.4-teal.svg)](https://chakra-ui.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> A powerful, real-time Albanian language translation platform with speech recognition capabilities, built with modern web technologies.

![Albanian Translator Demo](demo-placeholder.gif)

## Features

- Real-time Speech Recognition - Instantly capture and transcribe spoken words
- Bidirectional Translation - Seamless translation between Albanian and other languages
- Text-to-Speech - High-quality voice output powered by ElevenLabs
- Modern UI/UX - Beautiful, responsive interface built with Chakra UI
- Real-time Voice Calls - WebSocket-based communication for live translation
- Cross-Platform - Works on all modern browsers and devices

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Google Translate API key
- ElevenLabs API key (for text-to-speech)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tony-42069/translator.git
cd translator
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add your API keys:
```
REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

4. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application in action!

## Architecture

```
albanian-translator/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── CallInterface/    # Voice call UI components
│   │   ├── TranslationBox/   # Translation display components
│   │   └── SpeechControls/   # Audio control components
│   ├── services/         # Business logic and API integrations
│   │   ├── AudioService.js   # Audio processing service
│   │   ├── SocketService.js  # WebSocket communication
│   │   ├── TranslationService.js
│   │   └── ElevenLabsService.js
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Helper functions and constants
│   ├── tests/           # Test files
│   ├── App.js           # Main application component
│   └── index.js         # Application entry point
├── public/              # Static assets
└── config/             # Configuration files
```

## Technology Stack

- Frontend Framework: React 18.2.0
- UI Library: Chakra UI
- Translation: Google Cloud Translation API
- Speech Recognition: Web Speech API
- Text-to-Speech: ElevenLabs API
- Real-time Communication: Socket.IO
- State Management: React Context API
- Build Tool: Webpack

## Features in Detail

### Single User Translation
1. Select your speaking language (Albanian or English)
2. Click "Start Recording" to begin voice translation
3. Speak clearly into your microphone
4. View translations in real-time

### Voice Calls
1. Click "Start Call" to create a new room
2. Share the room code with another user
3. Other user clicks "Join Room" and enters the code
4. Begin speaking - translations will be automatic

## Security

- Environment variables are used for API key management
- HTTPS encryption for all API communications
- Input sanitization and validation
- Rate limiting implementation
- Regular security audits and updates
- Secure WebSocket connections

## Security Notice ⚠️

**IMPORTANT:** This application requires API keys for Google Cloud Translation and ElevenLabs. Never commit these keys to version control!

1. Create a `.env` file based on `.env.example`
2. Add your API keys to `.env`
3. Ensure `.env` is in your `.gitignore`
4. Never share or expose your API keys

If you accidentally commit API keys:
1. Immediately revoke and regenerate the exposed keys
2. Contact the service provider's security team
3. Review your git history for other potential exposures

## Testing

Run the test suite to verify functionality:
```bash
npm test
```

The test suite includes:
- WebSocket connection tests
- Audio processing verification
- Room management testing
- Translation pipeline validation

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Cloud Platform for translation services
- ElevenLabs for text-to-speech capabilities
- The amazing open-source community

---

© 2024 Albanian Translator. All rights reserved.
