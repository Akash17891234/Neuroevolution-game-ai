import numpy as np

class CarRacingGame:
    """Simple 2D car racing game for agent evaluation"""
    def __init__(self, track_width=100, track_length=1000):
        self.track_width = track_width
        self.track_length = track_length
        self.reset()
    
    def reset(self):
        """Reset game state"""
        self.car_x = self.track_width / 2  # Start in center
        self.car_y = 0
        self.car_speed = 5
        self.fitness = 0
        self.crashed = False
        self.steps = 0
        self.max_steps = 500
    
    def get_state(self):
        """Return current game state as input for neural network"""
        # Distance to left wall, distance to right wall, speed, progress
        dist_left = self.car_x
        dist_right = self.track_width - self.car_x
        progress = self.car_y / self.track_length
        
        return np.array([dist_left, dist_right, self.car_speed, progress])
    
    def step(self, action):
        """Execute one game step with agent action"""
        # Action: [steering, acceleration]
        steering = action[0]  # -1 to 1
        acceleration = action[1]  # -1 to 1
        
        # Update car position
        self.car_x += steering * 2  # Steering sensitivity
        self.car_speed = max(1, min(10, self.car_speed + acceleration * 0.5))
        self.car_y += self.car_speed
        
        # Check collision with walls
        if self.car_x < 0 or self.car_x > self.track_width:
            self.crashed = True
        
        # Check if reached end of track
        if self.car_y >= self.track_length:
            self.fitness += 1000  # Bonus for completing track
            self.crashed = True
        
        # Reward for staying on track and moving forward
        self.fitness += 1
        
        self.steps += 1
    
    def run_agent(self, agent):
        """Run a single agent through the game and return fitness"""
        self.reset()
        
        while not self.crashed and self.steps < self.max_steps:
            state = self.get_state()
            action = agent.predict(state)
            self.step(action)
        
        return self.fitness
