import React from 'react';
import ReactDOM from 'react-dom';

// MinigameForm Component
const MinigameForm = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = React.useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };
  
  return (
    <div className="generator-form">
      <h2>Generate Your Minigame</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prompt">Describe your minigame idea:</label>
          <textarea 
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A racing game with space cats, a puzzle game about time travel, a cooking simulation with magical ingredients..."
            disabled={isLoading}
            required
          />
        </div>
        <button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Generating...' : 'Generate Minigame'}
        </button>
      </form>
    </div>
  );
};

// MinigameCard Component
const MinigameCard = ({ minigame }) => {
  return (
    <div className="minigame-card">
      <img 
        src={minigame.imageUrl} 
        alt={minigame.title} 
        className="minigame-image" 
        loading="lazy"
      />
      <div className="minigame-content">
        <h3 className="minigame-title">{minigame.title}</h3>
        <p className="minigame-description">{minigame.description}</p>
        <details>
          <summary>Gameplay Details</summary>
          <p>{minigame.gameplay}</p>
        </details>
        <div className="minigame-author">
          <img 
            src={`https://images.websim.ai/avatar/${minigame.username}`} 
            alt={minigame.username} 
            className="author-avatar" 
          />
          <span>Created by {minigame.username}</span>
        </div>
      </div>
    </div>
  );
};

// MinigameGallery Component
const MinigameGallery = ({ minigames }) => {
  return (
    <div className="minigame-gallery">
      {minigames.length === 0 ? (
        <p>No minigames yet. Be the first to create one!</p>
      ) : (
        minigames.map(minigame => (
          <MinigameCard key={minigame.id} minigame={minigame} />
        ))
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [minigames, setMinigames] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    // Initial load of minigames
    const initialMinigames = API.getMinigames();
    setMinigames(initialMinigames);
    
    // Subscribe to updates
    const unsubscribe = API.subscribeToMinigames((updatedMinigames) => {
      // Sort by creation date, newest first
      const sortedMinigames = [...updatedMinigames].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setMinigames(sortedMinigames);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleGenerateMinigame = async (prompt) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Generate minigame description with AI
      const minigameDescription = await API.generateMinigameDescription(prompt);
      
      // Step 2: Generate image based on the visual description
      const imageUrl = await API.generateMinigameImage(minigameDescription.visuals);
      
      // Step 3: Save to database
      await API.saveMinigame({
        title: minigameDescription.title,
        description: minigameDescription.description,
        gameplay: minigameDescription.gameplay,
        visuals: minigameDescription.visuals,
        imageUrl: imageUrl,
        prompt: prompt
      });
      
      // Clear form (handled by state reset when loading is finished)
    } catch (error) {
      console.error('Error in minigame generation flow:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="app-container">
      <header>
        <h1>This Multiplayer Minigame Does Not Exist</h1>
        <p className="description">
          Generate fictional minigames with AI! Describe your idea and watch as our AI creates 
          a complete minigame concept with visuals. Share your creations with everyone in real-time!
        </p>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <MinigameForm onSubmit={handleGenerateMinigame} isLoading={isLoading} />
      
      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Creating your minigame... This may take a moment.</p>
        </div>
      )}
      
      <h2>Minigame Gallery</h2>
      <MinigameGallery minigames={minigames} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

