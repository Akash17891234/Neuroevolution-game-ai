# Neuroevolution Game AI Playground

A web-based playground where you can watch AI agents learn to race through genetic evolution. This project combines a neural network with a genetic algorithm to evolve optimal driving behaviors.

## Features

- **Real-time Visualization**: Watch agents race on a track in real-time using p5.js
- **Genetic Algorithm**: Evolution through selection, crossover, and mutation
- **Neural Network**: Simple feedforward network for agent decision-making
- **Analytics Dashboard**: Track fitness metrics across generations
- **WebSocket Communication**: Real-time updates between frontend and backend

## Architecture

### Backend (Python)
- **Flask**: Web server with WebSocket support
- **Genetic Algorithm**: Population-based optimization
- **Neural Network**: Agent decision-making
- **Game Engine**: Car racing simulation

### Frontend (React/Next.js)
- **p5.js**: Real-time game visualization
- **Recharts**: Analytics and fitness tracking
- **Socket.IO**: WebSocket client for real-time updates
- **Tailwind CSS**: Modern UI styling

## Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Create a virtual environment:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

3. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. Run the server:
\`\`\`bash
python app.py
\`\`\`

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open your browser to `http://localhost:3000`

## How It Works

### Genetic Algorithm
1. **Population**: Start with 50 random agents
2. **Evaluation**: Each agent plays the game and receives a fitness score
3. **Selection**: Tournament selection picks the best performers
4. **Crossover**: Mix genes from two parents to create offspring
5. **Mutation**: Randomly modify weights to introduce variation
6. **Repeat**: Evolve for multiple generations

### Neural Network
- **Input**: Car position, distance to walls, speed, progress
- **Hidden Layer**: 8 neurons with ReLU activation
- **Output**: Steering and acceleration commands
- **Weights**: Evolved by the genetic algorithm

### Game Mechanics
- Car starts in the center of the track
- Agents must stay on the track to survive
- Fitness increases for distance traveled
- Bonus points for completing the track
............................................................................................................ENDING MUTATION....................................................................................................................................................
