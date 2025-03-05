const API = {
  generateMinigameDescription: async (prompt) => {
    try {
      const completion = await websim.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a creative minigame designer. Create a detailed description for a fictional minigame based on the user's prompt.
            Structure your response as JSON with the following schema, and no other text:
            {
              "title": "Name of the minigame",
              "description": "A 3-4 sentence description of the minigame's concept",
              "gameplay": "A detailed paragraph about how the minigame is played",
              "visuals": "A detailed description of the visual style and key elements to include in an image"
            }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        json: true
      });
      
      return JSON.parse(completion.content);
    } catch (error) {
      console.error('Error generating minigame description:', error);
      throw new Error('Failed to generate minigame description. Please try again.');
    }
  },
  
  generateMinigameImage: async (visualDescription) => {
    try {
      const result = await websim.imageGen({
        prompt: visualDescription,
        aspect_ratio: "16:9"
      });
      
      return result.url;
    } catch (error) {
      console.error('Error generating minigame image:', error);
      throw new Error('Failed to generate minigame image. Please try again.');
    }
  },
  
  saveMinigame: async (minigameData) => {
    try {
      return await room.collection('minigame').create(minigameData);
    } catch (error) {
      console.error('Error saving minigame:', error);
      throw new Error('Failed to save minigame. Please try again.');
    }
  },
  
  getMinigames: () => {
    return room.collection('minigame').getList();
  },
  
  subscribeToMinigames: (callback) => {
    return room.collection('minigame').subscribe(callback);
  }
};

