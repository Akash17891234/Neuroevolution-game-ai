import numpy as np
from neural_network import NeuralNetwork
import random

class Agent:
    """Represents an individual agent with a neural network"""
    def __init__(self, input_size=4, hidden_size=8, output_size=2):
        self.nn = NeuralNetwork(input_size, hidden_size, output_size)
        self.fitness = 0
    
    def predict(self, state):
        """Get action from neural network given game state"""
        return self.nn.forward(state)
    
    def to_dict(self):
        """Convert agent to dictionary for serialization"""
        return {
            'fitness': self.fitness,
            'weights': self.nn.get_weights()
        }

class GeneticAlgorithm:
    """Genetic Algorithm for evolving neural network weights"""
    def __init__(self, population_size=50, mutation_rate=0.1, crossover_rate=0.8):
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.population = [Agent() for _ in range(population_size)]
        self.generation = 0
    
    def get_population(self):
        """Return current population"""
        return self.population
    
    def evaluate(self, fitness_scores):
        """Assign fitness scores to population"""
        for agent, score in zip(self.population, fitness_scores):
            agent.fitness = score
    
    def selection(self):
        """Tournament selection - select best agents for reproduction"""
        tournament_size = 5
        selected = []
        
        for _ in range(self.population_size):
            tournament = random.sample(self.population, tournament_size)
            winner = max(tournament, key=lambda a: a.fitness)
            selected.append(winner)
        
        return selected
    
    def crossover(self, parent1, parent2):
        """Create offspring by mixing parent weights"""
        child = Agent()
        
        # Get weights from both parents
        w1 = parent1.nn.get_weights()
        w2 = parent2.nn.get_weights()
        
        # Randomly select weights from each parent
        child_weights = []
        for weight1, weight2 in zip(w1, w2):
            if random.random() < self.crossover_rate:
                child_weights.append(weight1)
            else:
                child_weights.append(weight2)
        
        child.nn.set_weights(child_weights)
        return child
    
    def mutate(self, agent):
        """Randomly modify agent's weights"""
        weights = agent.nn.get_weights()
        mutated_weights = []
        
        for weight in weights:
            if random.random() < self.mutation_rate:
                # Add Gaussian noise to weight
                mutation = np.random.normal(0, 0.1)
                mutated_weights.append(weight + mutation)
            else:
                mutated_weights.append(weight)
        
        agent.nn.set_weights(mutated_weights)
    
    def evolve(self):
        """Create next generation through selection, crossover, and mutation"""
        # Selection
        selected = self.selection()
        
        # Create new population
        new_population = []
        
        # Elitism: keep best agent
        best_agent = max(self.population, key=lambda a: a.fitness)
        new_population.append(best_agent)
        
        # Generate offspring
        while len(new_population) < self.population_size:
            parent1 = random.choice(selected)
            parent2 = random.choice(selected)
            
            child = self.crossover(parent1, parent2)
            self.mutate(child)
            new_population.append(child)
        
        self.population = new_population
        self.generation += 1
