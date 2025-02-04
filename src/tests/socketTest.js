const SocketService = require('../services/SocketService');
const AudioService = require('../services/AudioService');

async function testSocketConnection() {
  console.log('Starting socket connection test...');
  
  try {
    // Test 1: Connect to server
    console.log('Test 1: Connecting to server...');
    await SocketService.connect();
    console.log('✓ Successfully connected to server');

    // Test 2: Create room
    console.log('\nTest 2: Creating room...');
    const roomId = await SocketService.createRoom();
    console.log('✓ Successfully created room:', roomId);

    // Test 3: Initialize audio
    console.log('\nTest 3: Initializing audio stream...');
    await AudioService.initializeStream();
    console.log('✓ Successfully initialized audio stream');

    // Test 4: Start streaming
    console.log('\nTest 4: Starting audio streaming...');
    await SocketService.startStreaming();
    console.log('✓ Successfully started streaming');

    // Test 5: Send test audio data
    console.log('\nTest 5: Sending test audio data...');
    const testAudioData = new Float32Array(1024).fill(0.5);
    SocketService.socket.emit('audio-stream', {
      roomId,
      audio: testAudioData,
      language: 'sq-AL'
    });
    console.log('✓ Successfully sent test audio data');

    // Test 6: Send test translation
    console.log('\nTest 6: Sending test translation...');
    SocketService.socket.emit('translation-result', {
      roomId,
      originalText: 'Përshëndetje',
      translatedText: 'Hello',
      targetLanguage: 'en-US'
    });
    console.log('✓ Successfully sent test translation');

    // Wait for a moment to ensure all events are processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 7: Cleanup
    console.log('\nTest 7: Cleaning up...');
    SocketService.disconnect();
    console.log('✓ Successfully cleaned up resources');

    console.log('\nAll tests completed successfully! 🎉');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run the tests
testSocketConnection().catch(console.error); 