from flask import Flask, flash, render_template, jsonify, g, request, redirect, url_for
import uuid
import os
import sqlite3

app = Flask(__name__)
def create_database(db_name, schema_file):
    """
    Create a new SQLite database based on the SQL schema file if the database does not already exist.
    :param db_name: Name of the SQLite database file
    :param schema_file: SQL schema file to create tables
    """
    # Check if the database already exists
    if not os.path.exists(db_name):
        # Connect to the SQLite database (or create it if it does not exist)
        conn = sqlite3.connect(db_name)
        print(f"Created database {db_name} successfully.")
        
        # Execute SQL script to create new tables
        with open(schema_file, 'r') as f:
            sql_script = f.read()
        conn.executescript(sql_script)
        print(f"Schema from {schema_file} executed successfully.")
        
        # Close the database connection
        conn.close()
    else:
        print("Database already exists.")

# Replace 'workoutdatabase.db' with your database file name and 'create-tables.sql' with your SQL file path
create_database('workoutdatabase.db', 'create-tables.sql')
DATABASE = 'workoutdatabase.db'

def get_db():
    if 'sqlite_db' not in g:
        g.sqlite_db = sqlite3.connect(DATABASE)
        g.sqlite_db.row_factory = sqlite3.Row
    return g.sqlite_db

@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop('sqlite_db', None)
    if db is not None:
        db.close()

@app.route('/')
def exercise_list():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Exercise")
    exercises = cur.fetchall()
    return render_template('exercise-list.html', exercises=exercises)

@app.route('/workout-list')
def workout_list():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Workout")
    workouts = cur.fetchall()
    return render_template('workout-list.html', workouts=workouts)

@app.route('/schedule')
def schedule():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT d.*, w.name AS workout_name, w.description AS workout_description
        FROM Day d
        JOIN Workout_On_Day wod ON d.day_id = wod.day_id
        JOIN Workout w ON wod.workout_id = w.workout_id
    """)
    days_with_workouts = cur.fetchall()
    return render_template('schedule.html', days=days_with_workouts)

scheduled_workouts = []

@app.route('/api/schedule-workout/<day_id>/<workout_id>', methods=['POST'])
def schedule_workout(day_id, workout_id):
    try:
        day_id = int(day_id)
        workout_id = int(workout_id)
        scheduled_workouts.append({'day_id': day_id, 'workout_id': workout_id})
        return jsonify({'message': 'Workout scheduled successfully'}), 200
    except ValueError:
        return jsonify({'error': 'Invalid day_id or workout_id'}), 400

@app.route('/api/workouts-by-day/<day_id>')
def get_workouts_by_day(day_id):
    try:
        day_id = int(day_id)
        day_workouts = [sw['workout_id'] for sw in scheduled_workouts if sw['day_id'] == day_id]
        return jsonify({'day_id': day_id, 'workouts': day_workouts}), 200
    except ValueError:
        return jsonify({'error': 'Invalid day_id'}), 400

@app.route('/api/exercises')
def api_exercises():
    filter_option = request.args.get('filter', None)

    # Define the base SQL query to retrieve all exercises
    sql_query = "SELECT * FROM Exercise"

    db = get_db()
    cur = db.cursor()

    # Execute the base SQL query to retrieve all exercises
    cur.execute(sql_query)
    exercises = cur.fetchall()

    if filter_option:
        # Handle filter options
        if filter_option == 'rating_high_low':
            exercises = sorted(exercises, key=lambda x: x['rating'], reverse=True)
        elif filter_option == 'rating_low_high':
            exercises = sorted(exercises, key=lambda x: x['rating'])
        elif filter_option == 'intensity_light':
            exercises = [exercise for exercise in exercises if exercise['intensity'] == 'Light']
        elif filter_option == 'intensity_moderate':
            exercises = [exercise for exercise in exercises if exercise['intensity'] == 'Moderate']
        elif filter_option == 'intensity_vigorous':
            exercises = [exercise for exercise in exercises if exercise['intensity'] == 'Vigorous']
        elif filter_option == 'muscle_chest':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Chest']
        elif filter_option == 'muscle_back':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Back']
        elif filter_option == 'muscle_shoulders':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Shoulders']
        elif filter_option == 'muscle_arms':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Arms']
        elif filter_option == 'muscle_abdominals':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Abdominals']
        elif filter_option == 'muscle_lower_back':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Lower Back']
        elif filter_option == 'muscle_hips':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Hips']
        elif filter_option == 'muscle_thighs':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Thighs']
        elif filter_option == 'muscle_legs':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Legs']
        elif filter_option == 'muscle_adductors_abductors':
            exercises = [exercise for exercise in exercises if exercise['muscle_group'] == 'Adductors and Abductors']
        else:
            # Invalid filter option
            return jsonify({'error': 'Invalid filter option'}), 400
    # Convert exercises to JSON format and return
    return jsonify([dict(x) for x in exercises])


@app.route('/api/workouts')
def api_workouts():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Workout")
    workouts = cur.fetchall()
    return jsonify([dict(x) for x in workouts])

@app.route('/api/exercises/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    db = get_db()
    db.execute("DELETE FROM Exercise WHERE exercise_id = ?", (exercise_id,))
    db.commit()
    return jsonify({'success': True}), 200

@app.route('/api/exercises/<int:workout_id>')
def api_exercises_by_workout(workout_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT DISTINCT e.* 
        FROM Exercise e 
        JOIN Exercise_In_Workout eiw ON e.exercise_id = eiw.exercise_id 
        WHERE eiw.workout_id = ?
    """, (workout_id,))
    exercises = cur.fetchall()
    return jsonify([dict(x) for x in exercises])

@app.route('/select-exercise/<int:workout_id>')
def select_exercise(workout_id):
    return render_template('select-exercise.html', workout_id=workout_id)

@app.route('/add-exercise', methods=['GET', 'POST'])
def add_exercise():
    if request.method == 'POST':
        name = request.form['name']
        muscle_group = request.form['muscle_group']
        intensity = request.form.get('intensity', '')
        rating = request.form.get('rating', '')  # Get the rating value from the form
        description = request.form.get('description', '')
        db = get_db()
        db.execute("INSERT INTO Exercise (name, muscle_group, intensity, rating, description) VALUES (?, ?, ?, ?, ?)",
                   (name, muscle_group, intensity, rating, description))  # Insert the rating value into the database
        db.commit()
        return redirect(url_for('exercise_list'))
    return render_template('add-exercise.html')

@app.route('/api/exercises-in-workouts/<int:workout_id>')
def exercises_in_workouts(workout_id):
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute("""
            SELECT e.*, eiw.workout_id IS NOT NULL as is_selected
            FROM Exercise e
            LEFT JOIN Exercise_In_Workout eiw ON e.exercise_id = eiw.exercise_id AND eiw.workout_id = ?
            ORDER BY e.exercise_id
        """, (workout_id,))
        exercises = cur.fetchall()
        return jsonify([{
            'exercise_id': ex['exercise_id'],
            'exercise_name': ex['name'],
            'intensity': ex['intensity'],
            'muscle_group': ex['muscle_group'],
            'is_selected': bool(ex['is_selected'])
        } for ex in exercises]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/exercise-to-workout/add/<int:workout_id>/<int:exercise_id>', methods=['POST'])
def add_exercise_to_workout(workout_id, exercise_id):
    db = get_db()
    try:
        db.execute("INSERT INTO Exercise_In_Workout (workout_id, exercise_id) VALUES (?, ?)", (workout_id, exercise_id))
        db.commit()
        return jsonify({'success': True, 'message': 'Exercise added to workout successfully.'})
    except sqlite3.IntegrityError as e:
        db.rollback()
        return jsonify({'success': False, 'message': str(e)})

# Remove an exercise from a workout
@app.route('/api/exercise-to-workout/remove/<int:workout_id>/<int:exercise_id>', methods=['DELETE'])
def remove_exercise_from_workout(workout_id, exercise_id):
    db = get_db()
    try:
        db.execute("DELETE FROM Exercise_In_Workout WHERE workout_id = ? AND exercise_id = ?", (workout_id, exercise_id))
        db.commit()
        return jsonify({'success': True, 'message': 'Exercise removed from workout successfully.'})
    except sqlite3.IntegrityError as e:
        db.rollback()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/edit-exercise/<int:exercise_id>', methods=['GET', 'POST'])
def edit_exercise(exercise_id):
    db = get_db()
    if request.method == 'POST':
        name = request.form['name']
        muscle_group = request.form['muscle_group']
        intensity = request.form.get('intensity', '')
        description = request.form.get('description', '')
        db.execute("UPDATE Exercise SET name=?, muscle_group=?, intensity=?, description=? WHERE exercise_id=?", (name, muscle_group, intensity, description, exercise_id))
        db.commit()
        return redirect(url_for('exercise_list'))
    else:
        cur = db.cursor()
        cur.execute("SELECT * FROM Exercise WHERE exercise_id = ?", (exercise_id,))
        exercise = cur.fetchone()
        return render_template('edit-exercise.html', exercise=exercise)

@app.route('/add-or-edit-workout/', defaults={'workout_id': None})
@app.route('/add-or-edit-workout/<int:workout_id>', methods=['GET', 'POST'])
def add_or_edit_workout(workout_id):
    db = get_db()
    if request.method == 'POST':
        name = request.form.get('name', 'Default Workout Name')
        description = request.form.get('description', '')
        intensity = request.form.get('intensity', 'Medium')
        focus = request.form.get('focus', 'General')

        if workout_id is None:
            workout_id = generate_workout_id()
            db.execute("INSERT INTO Workout (workout_id, name, description, intensity, focus) VALUES (?, ?, ?, ?, ?)",
                       (workout_id, name, description, intensity, focus))
            db.commit()
            return redirect(url_for('add_or_edit_workout', workout_id=workout_id))

        db.execute("UPDATE Workout SET name=?, description=?, intensity=?, focus=? WHERE workout_id=?",
                   (name, description, intensity, focus, workout_id))
        db.commit()
        return redirect(url_for('workout_list'))

    workout = None
    if workout_id:
        workout = db.execute("SELECT * FROM Workout WHERE workout_id = ?", (workout_id,)).fetchone()
    else:
        workout_id = generate_workout_id()  # Generate a new workout ID for a new workout

    # Redirect to add-workout.html with the workout ID in the URL
    return redirect(url_for('add_workout', workout_id=workout_id))

@app.route('/add-workout/', defaults={'workout_id': None}, methods=['GET'])
@app.route('/add-workout/<int:workout_id>', methods=['GET'])
def add_workout(workout_id):
    db = get_db()
    
    # If workout_id is None, generate a new workout ID
    if workout_id is None:
        workout_id = generate_workout_id()  # Generate a new workout ID
        
    # Fetch workout details if workout_id is provided
    workout = None
    if workout_id:
        workout = db.execute("SELECT * FROM Workout WHERE workout_id = ?", (workout_id,)).fetchone()
    
    # Render add-workout.html template, passing workout details and workout ID
    return render_template('add-workout.html', workout=workout, workout_id=workout_id)



@app.route('/api/add-exercises-to-workout/<int:workout_id>', methods=['POST'])
def add_exercises_to_workout(workout_id):
    db = get_db()
    exercises = request.json.get('exercises')
    try:
        for exercise_id in exercises:
            db.execute("INSERT INTO Exercise_In_Workout (exercise_id, workout_id) VALUES (?, ?)",
                       (exercise_id, workout_id))
        db.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.rollback()
        print(e)
        return jsonify({'success': False, 'error': str(e)}), 500
    
@app.route('/api/exercises-with-workouts/<int:workout_id>')
def exercises_with_workouts(workout_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT e.exercise_name, w.name as workout_name
        FROM Exercise e
        JOIN Exercise_In_Workout eiw ON e.id = eiw.exercise_id
        JOIN Workout w ON eiw.workout_id = w.id
        WHERE w.id = ?
    """, (workout_id,))
    exercises = [{'exercise_name': row[0], 'workout_name': row[1]} for row in cur.fetchall()]
    return jsonify(exercises)


@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    db = get_db()
    db.execute("DELETE FROM Workout WHERE workout_id = ?", (workout_id,))
    db.commit()
    return jsonify({'success': True}), 200



@app.route('/edit-workout/<int:workout_id>', methods=['GET', 'POST'])
def edit_workout(workout_id):
    db = get_db()
    if request.method == 'POST':
        name = request.form['name']
        description = request.form.get('description', '')
        intensity = request.form.get('intensity', '')
        focus = request.form.get('focus', '')
        db.execute("UPDATE Workout SET name=?, description=?, intensity=?, focus=? WHERE workout_id=?",
                   (name, description, intensity, focus, workout_id))
        db.commit()
        return redirect(url_for('workout_list'))
    else:
        cur = db.cursor()
        cur.execute("SELECT * FROM Workout WHERE workout_id = ?", (workout_id,))
        workout = cur.fetchone()
        return render_template('edit-workout.html', workout=workout)

def generate_workout_id():
    workout_uuid = uuid.uuid4()
    return int(workout_uuid.int % (2**31 - 1))

@app.route('/create-workout', methods=['GET'])
def create_workout():
    workout_id = generate_workout_id()
    db = get_db()
    db.execute("INSERT INTO Workout (workout_id, name, description) VALUES (?, ?, ?)", (workout_id, 'New Workout', 'Description here'))
    db.commit()
    return redirect(url_for('select_exercise', workout_id=workout_id))

def generate_day_id():
    day_uuid = uuid.uuid4()
    return str(day_uuid)

@app.route('/api/generate-day-id', methods=['GET'])
def generate_day_id_endpoint():
    day_id = generate_day_id()
    return jsonify(day_id=day_id)

@app.route('/api/add-day', methods=['POST'])
def add_day():
    data = request.get_json()
    day_id = data.get('day_id')
    if day_id:
        try:
            db = get_db()
            db.execute("INSERT INTO Day (day_id) VALUES (?)", (day_id,))
            db.commit()
            return jsonify({'success': True}), 200
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    else:
        return jsonify({'success': False, 'error': 'No day ID provided'}), 400

@app.route('/select-workout.html')
def select_workout():
    return render_template('select-workout.html')

if __name__ == '__main__':
    app.run(debug=True)
