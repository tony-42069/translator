# Albanian Translator

A React-based application that provides real-time Albanian language translation services with speech recognition capabilities.

## Features

- Real-time speech recognition
- Albanian language translation
- Text-to-speech functionality using ElevenLabs
- Modern UI built with Chakra UI
- WebRTC support for real-time communication

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v12 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```
REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
```

## Running the Application

To start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
albanian-translator/
├── src/
│   ├── components/      # React components
│   ├── services/        # Service layer (translation, speech recognition)
│   ├── App.js          # Main application component
│   └── index.js        # Application entry point
├── public/             # Static files
└── package.json        # Project dependencies and scripts
```

## Technologies Used

- React 18.2.0
- Chakra UI
- Google Translate API
- WebRTC
- ElevenLabs API

## Development

The application uses environment variables for API keys. Make sure to:
- Never commit the `.env` file
- Keep API keys secure
- Use the development environment for testing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
