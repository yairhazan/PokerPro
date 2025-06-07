// Node.js script to generate tick and chime .wav files for browser use
const fs = require('fs');
const wav = require('wav');

function writeWav(filename, samples, sampleRate = 44100) {
  const writer = new wav.FileWriter(filename, {
    channels: 1,
    sampleRate,
    bitDepth: 16,
  });
  const buffer = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), i * 2);
  }
  writer.write(buffer);
  writer.end();
}

// Generate a tick: short click (2ms)
function generateTick() {
  const sampleRate = 44100;
  const duration = 0.02; // 20ms
  const samples = [];
  for (let i = 0; i < sampleRate * duration; i++) {
    samples.push(i < 10 ? 1 - i / 10 : 0); // sharp click
  }
  return samples;
}

// Generate a chime: short sine wave (A4, 440Hz, 0.3s)
function generateChime() {
  const sampleRate = 44100;
  const duration = 0.3;
  const freq = 880; // A5
  const samples = [];
  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    // Sine wave with exponential decay
    samples.push(Math.sin(2 * Math.PI * freq * t) * Math.exp(-3 * t));
  }
  return samples;
}

fs.mkdirSync('frontend/public/sounds', { recursive: true });
writeWav('frontend/public/sounds/tick.wav', generateTick());
writeWav('frontend/public/sounds/level-change.wav', generateChime());

console.log('Generated tick.wav and level-change.wav in frontend/public/sounds/'); 