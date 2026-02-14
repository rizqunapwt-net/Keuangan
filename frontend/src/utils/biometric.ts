import * as faceapi from 'face-api.js';

export const loadModels = async () => {
    const MODEL_URL = '/models';
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log('Face AI Models Loaded');
        return true;
    } catch (error) {
        console.error('Error loading models:', error);
        return false;
    }
};

export const getFaceDescriptor = async (videoElement: HTMLVideoElement) => {
    const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detection?.descriptor;
};

export const compareFaceDescriptors = (descriptor1: number[], descriptor2: number[]) => {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return distance < 0.6; // 0.6 is a standard threshold
};
