import axios from 'axios';

interface BlindStructureResponse {
  config: {
    levelTime: number;
    startingBB: number;
    Ante: boolean;
  };
  blindStructure: Array<{
    level: number;
    smallBlind: number;
    bigBlind: number;
    ante: number;
    duration: number;
  }>;
  breaks: Array<{
    name: string;
    duration: number;
    afterLevel: number;
  }>;
}

const API_BASE_URL = 'http://localhost:3000/api/blind-structure';

const generateBlindStructure = async () => {
  try {
    // Blind structure configuration
    const blindStructureConfig = {
      levelTime: 20,    // 20 minutes per level
      startingBB: 50,   // 50BB starting stack
      Ante: true        // Include antes after level 5
    };

    console.log('Generating blind structure...');
    const response = await axios.post<BlindStructureResponse>(`${API_BASE_URL}/generate`, blindStructureConfig);
    console.log('Blind Structure:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the test
generateBlindStructure(); 