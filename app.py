from flask import Flask, render_template, jsonify, g
from datetime import datetime
import calendar
import sqlite3

app = Flask(__name__)

DATABASE = 'exercisedatabase.db'  # Ensure this is the correct path to your SQLite database

def get_db():
    """Open a new database connection if there is none yet for the current application context."""
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = sqlite3.connect(DATABASE)
        g.sqlite_db.row_factory = sqlite3.Row
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

@app.route('/api/exercises')
def api_exercises():
    """API endpoint to fetch all exercises."""
    db = get_db()
    cur = db.cursor()
    query = '''
    SELECT * FROM Exercise
    '''
    cur.execute(query)
    exercises = cur.fetchall()
    return jsonify([dict(x) for x in exercises])

@app.route('/')
def exercise_list():
    return render_template('exercise-list.html')

@app.route('/add-exercise')
def add_exercise():
    return render_template('add-exercise.html')

@app.route('/add-workout')
def add_workout():
    return render_template('add-workout.html')

@app.route('/workout-list')
def workout_list():
    return render_template('workout-list.html')

@app.route('/schedule')
def schedule():
    # Fetch data from your database
    # For instance, get workouts for the current month
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Day JOIN Workout_On_Day ON Day.day_id = Workout_On_Day.day_id")
    days = cur.fetchall()
    return render_template('schedule.html', days=days)


@app.route('/select-exercise')
def select_exercise():
    return render_template('select-exercise.html')

if __name__ == '__main__':
    app.run(debug=True)
