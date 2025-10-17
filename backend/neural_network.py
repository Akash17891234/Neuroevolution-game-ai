import numpy as np

class NeuralNetwork:
    """Simple feedforward neural network for agent decision-making"""
    def __init__(self, input_size=4, hidden_size=8, output_size=2):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # Initialize weights randomly
        self.w1 = np.random.randn(input_size, hidden_size) * 0.5
        self.b1 = np.zeros((1, hidden_size))
        self.w2 = np.random.randn(hidden_size, output_size) * 0.5
        self.b2 = np.zeros((1, output_size))
    
    def relu(self, x):
        """ReLU activation function"""
        return np.maximum(0, x)
    
    def relu_derivative(self, x):
        """ReLU derivative"""
        return (x > 0).astype(float)
    
    def tanh(self, x):
        """Tanh activation for output"""
        return np.tanh(x)
    
    def forward(self, state):
        """Forward pass through network"""
        state = np.array(state).reshape(1, -1)
        
        # Hidden layer
        self.z1 = np.dot(state, self.w1) + self.b1
        self.a1 = self.relu(self.z1)
        
        # Output layer
        self.z2 = np.dot(self.a1, self.w2) + self.b2
        output = self.tanh(self.z2)
        
        return output[0]
    
    def get_weights(self):
        """Return all weights as flat array"""
        return np.concatenate([
            self.w1.flatten(),
            self.b1.flatten(),
            self.w2.flatten(),
            self.b2.flatten()
        ])
    
    def set_weights(self, weights):
        """Set weights from flat array"""
        weights = np.array(weights)
        idx = 0
        
        # Reshape w1
        w1_size = self.input_size * self.hidden_size
        self.w1 = weights[idx:idx+w1_size].reshape(self.input_size, self.hidden_size)
        idx += w1_size
        
        # Reshape b1
        b1_size = self.hidden_size
        self.b1 = weights[idx:idx+b1_size].reshape(1, self.hidden_size)
        idx += b1_size
        
        # Reshape w2
        w2_size = self.hidden_size * self.output_size
        self.w2 = weights[idx:idx+w2_size].reshape(self.hidden_size, self.output_size)
        idx += w2_size
        
        # Reshape b2
        self.b2 = weights[idx:].reshape(1, self.output_size)
