from flask import Flask, render_template, jsonify, g, request, redirect, url_for
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

@app.route('/api/workouts')
def api_workouts():
    """API endpoint to fetch all workouts."""
    db = get_db()
    cur = db.cursor()
    query = '''
    SELECT * FROM Workout
    '''
    cur.execute(query)
    workouts = cur.fetchall()
    return jsonify([dict(x) for x in workouts])


@app.route('/')
def exercise_list():
    return render_template('exercise-list.html')


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

@app.route('/add-exercise', methods=['GET', 'POST'])
def add_exercise():
    if request.method == 'POST':
        # Process form submission
        try:
            name = request.form['name']
            muscle_group = request.form['muscle_group']
            intensity = request.form.get('intensity', '')
            description = request.form.get('description', '')

            db = get_db()
            db.execute('''
                INSERT INTO Exercise (name, muscle_group, intensity, description)
                VALUES (?, ?, ?, ?)
            ''', (name, muscle_group, intensity, description))
            db.commit()
            return redirect(url_for('exercise_list'))
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return redirect(url_for('add_exercise'))  # Redirects back to the form on error
    else:
        # Display the form
        return render_template('add-exercise.html')

@app.route('/api/exercises/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    db = get_db()
    try:
        db.execute('DELETE FROM Exercise WHERE exercise_id = ?', (exercise_id,))
        db.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
