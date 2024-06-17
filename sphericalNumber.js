const processedVideo = document.getElementById('processedVideo');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureInterval = 3000;

let intensityValues = [];
let lastCaptureTime = 0;

// Access the camera stream and initialize
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    const videoTrack = stream.getVideoTracks()[0];
    const processor = new MediaStreamTrackProcessor({ track: videoTrack });
    const generator = new MediaStreamTrackGenerator({ kind: 'video' });
    const reader = processor.readable.getReader();
    const writer = generator.writable.getWriter();

    const mediaStream = new MediaStream([generator]);
    processedVideo.srcObject = mediaStream;

    // OffscreenCanvas creation and context initialization
    const offscreenCanvas = new OffscreenCanvas(800, 800);
    const ctxOffscreen = offscreenCanvas.getContext('2d');

    async function processFrame(frame) {
        const width = frame.displayWidth;
        const height = frame.displayHeight;
        ctxOffscreen.drawImage(frame, 0, 0, width, height);
        
        const imageData = ctxOffscreen.getImageData(0, 0, width, height);
        const frameData = imageData.data;

        let totalBrightness = 0;
        for (let i = 0; i < frameData.length; i += 4) {
            const r = frameData[i];
            const g = frameData[i + 1];
            const b = frameData[i + 2];
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;
        }

        const avgBrightness = totalBrightness / (width * height);
        intensityValues.push(avgBrightness);
        const { variance, stdDev } = calculateVarianceAndStdDev(intensityValues);
        
        drawSphereVisualization(avgBrightness, variance, stdDev);

        const processedFrame = new VideoFrame(offscreenCanvas, { timestamp: frame.timestamp });
        await writer.write(processedFrame);
        frame.close();
    }

    function drawSphereVisualization(avgBrightness, variance, stdDev) {
        const points = 1000;  // Increased the number of points for better visualization
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaledAvgBrightness = avgBrightness / 255 * canvas.width / 2;
        const scaledVariance = variance / 255 * canvas.height / 2;
        const scaledStdDev = stdDev / 255 * canvas.width / 2;

        console.log(`Drawing sphere with avgBrightness: ${avgBrightness}, variance: ${variance}, stdDev: ${stdDev}`);
        console.log(`Scaled values - x: ${scaledAvgBrightness}, y: ${scaledVariance}, z: ${scaledStdDev}`);

        for (let i = 0; i < points; i++) {
            const theta = Math.acos(2 * Math.random() - 1); // [0, π]
            const phi = 2 * Math.PI * Math.random(); // [0, 2π]
            const x = scaledAvgBrightness * Math.sin(theta) * Math.cos(phi);
            const y = scaledVariance * Math.sin(theta) * Math.sin(phi);
            const z = scaledStdDev * Math.cos(theta);

            const size = 2; // Size of each point
            drawPoint(x, y, z, size);
        }
    }

    function drawPoint(x, y, z, size) {
        const perspectiveFactor = 1 / (1 - z / 500); // Perspective projection
        const screenX = x * perspectiveFactor + canvas.width / 2;
        const screenY = y * perspectiveFactor + canvas.height / 2;

        console.log(`Drawing point at - screenX: ${screenX}, screenY: ${screenY}, size: ${size}`);

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
    }

    async function readFrames() {
        while (true) {
            const { value: frame, done } = await reader.read();
            if (done) break;
            await processFrame(frame);
        }
    }

    readFrames();

}).catch((error) => {
    console.error('Error accessing the camera:', error);
});

async function captureFrame() {
    const currentTime = Date.now();
    if (currentTime - lastCaptureTime < captureInterval) {
        return Promise.resolve(null);
    }
    lastCaptureTime = currentTime;
    const frame = await new Promise((resolve) => {
        processedVideo.requestVideoFrameCallback((now, metadata) => resolve(metadata));
    });
    await processFrame(frame);
}

function logAmbientLight() {
    const averageIntensity = calculateAverageLight();
    intensityValues.push(averageIntensity);
    const { variance, stdDev } = calculateVarianceAndStdDev(intensityValues);
    const ambientLightDisplay = document.getElementById('ambient-light-display');
    ambientLightDisplay.textContent = `Average Light Intensity: ${averageIntensity.toFixed(2)}, Variance: ${variance.toFixed(2)}, Std Dev: ${stdDev.toFixed(2)}`;
}

async function animate() {
    await captureFrame();
    logAmbientLight();
    requestAnimationFrame(animate);
}

animate();

function calculateVarianceAndStdDev(intensityValues) {
    const meanIntensity = intensityValues.reduce((acc, val) => acc + val, 0) / intensityValues.length;
    const variance = intensityValues.reduce((acc, val) => acc + Math.pow(val - meanIntensity, 2), 0) / intensityValues.length;
    const stdDev = Math.sqrt(variance);
    return { variance, stdDev };
}

function calculateAverageLight() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let sum = 0;

    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const intensity = (red + green + blue) / 3;
        sum += intensity;
    }

    const averageIntensity = sum / (data.length / 4);
    return averageIntensity;
}
