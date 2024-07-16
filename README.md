# visualizingLight
A program that captures video frames from the user's camera, calculates ambient light values and visualizes the data as a 3D sphere on a canvas.
This code combines elements of computer vision, data visualization, and procedural animation.

## Functionality Explanation:

### Camera Access and Initialization:
The program accesses the user's camera to obtain the camera stream, initializes a MediaStreamTrackProcessor and a MediaStreamTrackGenerator to read and write video frames, respectively. The processed frames are displayed in the processedVideo element.

### Frame Processing:
An offscreen canvas is used to draw each video frame. The frame's pixel data is analyzed to calculate its average brightness and compute the variance and standard deviation of brightness values.

### Visualization:
The drawSphereVisualization function creates a 3D-like representation of the brightness data on the main canvas. It uses spherical coordinates to place points in a pseudo-3D space, with point positions influenced by the calculated brightness, variance, and standard deviation. The points are then projected onto a 2D canvas using a simple perspective projection.

### Animation and Logging:
The animate function captures frames at intervals, processes them, and logs the average brightness, variance, and standard deviation to a display element. This function calls itself recursively using requestAnimationFrame to create a continuous animation loop.


## Control-Flow Snapshot:

Access the camera stream using navigator.mediaDevices.getUserMedia.
Initialize MediaStreamTrackProcessor and MediaStreamTrackGenerator.
Create a media stream for processed video and set it as the source of processedVideo.
Set up an offscreen canvas for frame processing.
Define processFrame function:
Draw the frame on the offscreen canvas.
Calculate the average brightness of the frame.
Push the brightness value to intensityValues.
Compute variance and standard deviation of brightness values.
Draw the sphere visualization based on brightness data.
Create a processed frame and write it to the generator.
Define drawSphereVisualization function:
Clear the main canvas.
Convert brightness values to scaled values.
Use spherical coordinates to draw points.
Apply perspective projection to draw points on the canvas.
Define drawPoint function:
Calculate screen coordinates based on perspective projection.
Draw a point on the canvas.
Define readFrames function:
Continuously read and process frames.
Start reading frames by calling readFrames.
Define captureFrame function:
Capture frames at intervals.
Process captured frames.
Define logAmbientLight function:
Calculate and log average brightness, variance, and standard deviation.
Define animate function:
Capture and process frames.
Log ambient light data.
Request the next animation frame.
Start the animation loop by calling animate.
Define helper functions calculateVarianceAndStdDev and calculateAverageLight.
