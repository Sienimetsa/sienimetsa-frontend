// This Component handles interactions with the AI server for mushroom detection.
import * as ImageManipulator from "expo-image-manipulator";
import { AI_SERVER_UPLOAD_URL, AI_SERVER_URL } from "@env";

// Check if the AI server is currently accessible
export const checkAIServerStatus = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${AI_SERVER_URL}`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("AI server check failed:", error);
    return false;
  }
};

// Optimize an image for AI processing by resizing and compressing
export const optimizeImageForAI = async (imageUri) => {
  try {
    return await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 300 } }], // Resize to smaller width
      {
        compress: 0.5,  // More aggressive compression
        format: ImageManipulator.SaveFormat.JPEG
      }
    );
  } catch (error) {
    console.error("Image optimization failed:", error);
    return null;
  }
};

// Send an image to the AI service for mushroom detection
export const sendImageToAIService = async (imageData, onProgressUpdate = null) => {
  try {
    // Create form data for image upload
    const formData = new FormData();
    formData.append('image', {
      uri: imageData.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    // Setup progress simulation if callback provided
    let progressInterval;
    if (onProgressUpdate) {
      let progress = 0;
      progressInterval = setInterval(() => {
        // Simulate progress up to 95% (leave 5% for final processing)
        if (progress < 95) {
          progress += 1;
          onProgressUpdate(progress);
        }
      }, 1000); // Update every second
    }

    // Send the image with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    const response = await fetch(`${AI_SERVER_UPLOAD_URL}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Clean up progress interval
    if (progressInterval) clearInterval(progressInterval);

    // Set to 100% when complete
    if (onProgressUpdate) onProgressUpdate(100);

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Clean up on error
    if (onProgressUpdate) onProgressUpdate(0);
    throw error; // Re-throw for handling in component
  }
};

// Find the best mushroom match from AI results based on confidence level
export const findBestMushroomMatch = (aiData, mushroomList) => {
  try {
    // Check if we have valid predictions from model2 (highest priority)
    if (!aiData?.model2_prediction?.predictions?.length) return null;

    // Get best prediction with highest confidence
    const topPrediction = [...aiData.model2_prediction.predictions]
      .sort((a, b) => b.confidence - a.confidence)[0];

    // Only return if confidence is high enough
    if (topPrediction.confidence < 0.7) return null;

    // Find matching mushroom by name
    return mushroomList.find(m =>
      m.mname.toLowerCase() === topPrediction.class.toLowerCase() ||
      (m.cmname && m.cmname.toLowerCase() === topPrediction.class.toLowerCase())
    );

  } catch (error) {
    console.error("Error finding mushroom match:", error);
    return null;
  }
};

// Format AI prediction results into a consistent structure for display
export const formatAIResults = (aiResults, mushroomList = []) => {
  // Map to track best predictions by mushroom id
  const bestPredictions = new Map();

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Process each model in priority order
  const processModel = (modelData, modelName) => {
    if (modelData.length > 0) {
      // Filter out "CoW" predictions and sort by confidence
      const validPredictions = modelData.filter(p => {
        // Filter out CoW predictions
        if (p.class === "CoW" || p.class.toLowerCase() === "cow") {
          return false;
        }

        // If mushroomList is provided, validate that the prediction exists in the database
        if (mushroomList.length > 0) {
          const exists = mushroomList.some(m =>
            m.mname.toLowerCase() === p.class.toLowerCase() ||
            (m.cmname && m.cmname.toLowerCase() === p.class.toLowerCase())
          );
          return exists;
        }

        return true;
      });

      if (validPredictions.length > 0) {
        // Process each valid prediction
        for (const prediction of validPredictions) {
          // Find the actual mushroom in our database
          const mushroom = mushroomList.find(m =>
            m.mname.toLowerCase() === prediction.class.toLowerCase() ||
            (m.cmname && m.cmname.toLowerCase() === prediction.class.toLowerCase())
          );

          // Skip if no matching mushroom found
          if (!mushroom) continue;

          const mushroomId = mushroom.m_id;
          const confidence = prediction.confidence;

          // Use cmname (common name) if available, otherwise use class name from prediction
          const commonName = mushroom.cmname ?
            capitalizeFirstLetter(mushroom.cmname) :
            capitalizeFirstLetter(prediction.class);

          // Use mname for latin name
          const latinName = capitalizeFirstLetter(mushroom.mname);

          // Check if we already have a prediction for this mushroom
          if (!bestPredictions.has(mushroomId) ||
            bestPredictions.get(mushroomId).confidence < confidence) {
            // Store this prediction as the best for this mushroom
            bestPredictions.set(mushroomId, {
              class: commonName,
              latinName: latinName,
              confidence: confidence,
              confidenceValue: confidence,
              model: modelName,
              mushroomId: mushroomId
            });
          }
        }
      }
    }
  };

  // Process models in order of reliability
  processModel(aiResults.model2, "Model 2");
  processModel(aiResults.model5, "Model 5");
  processModel(aiResults.model4, "Model 4");
  processModel(aiResults.model1, "Model 1");
  processModel(aiResults.model3, "Model 3");

  // Convert Map to array and format confidence for display
  const results = [...bestPredictions.values()].map(prediction => ({
    ...prediction,
    confidence: Math.round(prediction.confidence * 100) + "%"
  }));

  // Sort by confidence value (highest first)
  const sortedResults = results
    .sort((a, b) => b.confidenceValue - a.confidenceValue)
    .slice(0, 3); // Take top 3

  // Fill with empty results if needed
  while (sortedResults.length < 3) {
    sortedResults.push({
      class: "No prediction",
      latinName: "",
      confidence: "0%",
      confidenceValue: 0,
      model: `Model ${sortedResults.length + 1}`,
      mushroomId: null
    });
  }

  return sortedResults;
};