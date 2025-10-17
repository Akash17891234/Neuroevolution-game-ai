from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import threading
import time
from genetic_algorithm import GeneticAlgorithm
from game_engine import CarRacingGame

app = Flask(__name__)
app.config['SECRET_KEY'] = 'neuroevolution-secret'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global state
ga = None
game = None
simulation_running = False
current_generation = 0
generation_stats = []
simulation_thread = None

def run_simulation():
    """Main simulation loop that runs GA and game logic"""
    global ga, game, simulation_running, current_generation, generation_stats
    
    while simulation_running:
        try:
            # Run one generation
            population = ga.get_population()
            fitness_scores = []
            
            # Evaluate each agent in the population
            for agent in population:
                game.reset()
                fitness = game.run_agent(agent)
                fitness_scores.append(fitness)
            
            # Update GA with fitness scores
            ga.evaluate(fitness_scores)
            
            # Calculate generation statistics
            stats = {
                'generation': current_generation,
                'best_fitness': float(max(fitness_scores)),
                'avg_fitness': float(sum(fitness_scores) / len(fitness_scores)),
                'worst_fitness': float(min(fitness_scores)),
                'population_size': len(population)
            }
            generation_stats.append(stats)
            
            # Emit stats to all connected clients
            socketio.emit('generation_complete', stats, broadcast=True)
            print(f"[v0] Generation {current_generation} complete - Best: {stats['best_fitness']:.2f}")
            
            # Evolve to next generation
            ga.evolve()
            current_generation += 1
            
            # Small delay to prevent CPU overload
            time.sleep(0.1)
        except Exception as e:
            print(f"[v0] Error in simulation loop: {e}")
            simulation_running = False
            socketio.emit('simulation_error', {'error': str(e)}, broadcast=True)

@socketio.on('connect')
def handle_connect():
    print('[v0] Client connected')
    emit('connection_response', {'data': 'Connected to neuroevolution server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('[v0] Client disconnected')

@socketio.on('start_simulation')
def handle_start_simulation(data):
    global ga, game, simulation_running, current_generation, generation_stats, simulation_thread
    
    population_size = data.get('population_size', 50)
    generations = data.get('generations', 100)
    
    if simulation_running:
        emit('error', {'message': 'Simulation already running'})
        return
    
    try:
        # Initialize GA and Game
        ga = GeneticAlgorithm(population_size=population_size)
        game = CarRacingGame()
        
        simulation_running = True
        current_generation = 0
        generation_stats = []
        
        # Start simulation in background thread
        simulation_thread = threading.Thread(target=run_simulation, daemon=True)
        simulation_thread.start()
        
        print(f"[v0] Simulation started with population size: {population_size}")
        emit('simulation_started', {'population_size': population_size}, broadcast=True)
    except Exception as e:
        print(f"[v0] Error starting simulation: {e}")
        emit('error', {'message': str(e)})

@socketio.on('stop_simulation')
def handle_stop_simulation():
    global simulation_running
    simulation_running = False
    print('[v0] Simulation stopped')
    emit('simulation_stopped', broadcast=True)

@socketio.on('get_stats')
def handle_get_stats():
    emit('stats_update', {
        'generation': current_generation,
        'stats_history': generation_stats
    })

@socketio.on('get_population')
def handle_get_population():
    """Send current population state for visualization"""
    if ga:
        population = ga.get_population()
        emit('population_update', {
            'agents': [agent.to_dict() for agent in population],
            'generation': current_generation
        })

if __name__ == '__main__':
    print('[v0] Starting Neuroevolution Server on http://0.0.0.0:5000')
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
