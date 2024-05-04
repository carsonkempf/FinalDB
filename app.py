from flask import Flask, render_template, jsonify, g, request, redirect, url_for
import uuid
import sqlite3

app = Flask(__name__)
DATABASE = 'exercisedatabase.db'

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
    return render_template('workout-list.html')

@app.route('/schedule')
def schedule():
    db = get_db()
    cur = db.cursor()
    # Perform a JOIN operation between Day and Workout_On_Day to get the workout_id for each day
    # Then JOIN with Workout table to get workout details
    cur.execute("""
        SELECT d.*, w.name AS workout_name, w.description AS workout_description
        FROM Day d
        JOIN Workout_On_Day wod ON d.day_id = wod.day_id
        JOIN Workout w ON wod.workout_id = w.workout_id
    """)
    days_with_workouts = cur.fetchall()
    return render_template('schedule.html', days=days_with_workouts)


@app.route('/schedule.html')
def schedule_page():
    return render_template('schedule.html')

scheduled_workouts = []

# Route to join a workout with a day
@app.route('/api/schedule-workout/<day_id>/<workout_id>', methods=['POST'])
def schedule_workout(day_id, workout_id):
    try:
        # Parse day_id and workout_id as integers
        day_id = int(day_id)
        workout_id = int(workout_id)

        # Add the scheduled workout to the list
        scheduled_workouts.append({'day_id': day_id, 'workout_id': workout_id})

        return jsonify({'message': 'Workout scheduled successfully'}), 200
    except ValueError:
        return jsonify({'error': 'Invalid day_id or workout_id'}), 400

# Route to get all workouts scheduled for a specific day
@app.route('/api/workouts-by-day/<day_id>')
def get_workouts_by_day(day_id):
    try:
        # Parse day_id as integer
        day_id = int(day_id)

        # Filter scheduled workouts for the given day_id
        day_workouts = [sw['workout_id'] for sw in scheduled_workouts if sw['day_id'] == day_id]

        return jsonify({'day_id': day_id, 'workouts': day_workouts}), 200
    except ValueError:
        return jsonify({'error': 'Invalid day_id'}), 400

@app.route('/api/exercises')
def api_exercises():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Exercise")
    exercises = cur.fetchall()
    return jsonify([dict(x) for x in exercises])

@app.route('/api/workouts')
def api_workouts():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM Workout")
    workouts = cur.fetchall()
    return jsonify([dict(x) for x in workouts])

@app.route('/api/select-workout')
def api_select_workout():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM Workout')
        workouts = cursor.fetchall()
        conn.close()

        # Convert the database rows to a list of dictionaries
        workouts_list = []
        for workout in workouts:
            workouts_list.append(dict(workout))

        return jsonify(workouts_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
    cur.execute("SELECT DISTINCT e.* FROM Exercise e JOIN Exercise_In_Workout eiw ON e.exercise_id = eiw.exercise_id WHERE eiw.workout_id = ?", (workout_id,))
    exercises = cur.fetchall()
    return jsonify([dict(x) for x in exercises])

@app.route('/select-exercise/<int:workout_id>')
def select_exercise(workout_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT DISTINCT * FROM Exercise")  # Fetching all unique exercises
    exercises = cur.fetchall()
    return render_template('select-exercise.html', exercises=exercises, workout_id=workout_id)

@app.route('/add-exercise', methods=['GET', 'POST'])
def add_exercise():
    if request.method == 'POST':
        name = request.form['name']
        muscle_group = request.form['muscle_group']
        intensity = request.form.get('intensity', '')
        description = request.form.get('description', '')
        db = get_db()
        db.execute("INSERT INTO Exercise (name, muscle_group, intensity, description) VALUES (?, ?, ?, ?)", (name, muscle_group, intensity, description))
        db.commit()
        return redirect(url_for('exercise_list'))
    return render_template('add-exercise.html')

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
    cur = db.cursor()
    cur.execute("SELECT * FROM Exercise WHERE exercise_id = ?", (exercise_id,))
    exercise = cur.fetchone()
    return render_template('edit-exercise.html', exercise=exercise)

@app.route('/add-workout', methods=['GET', 'POST'])
def add_workout():
    # Use a variable that matches the template expectation
    generated_workout_id = request.args.get('workout_id')

    if generated_workout_id is None:
        # Generate ID only when not provided, simulating the creation of a new workout
        generated_workout_id = generate_workout_id()
        db = get_db()
        db.execute("INSERT INTO Workout (workout_id, name, description, focus, intensity) VALUES (?, ?, ?, ?, ?)", 
                   (generated_workout_id, 'Default Workout Name', 'No description', 'General', 'Medium'))
        db.commit()

    if request.method == 'POST':
        db = get_db()
        name = request.form['name']
        description = request.form.get('description', 'No description provided')
        focus = request.form.get('focus', 'General')
        intensity = request.form.get('intensity', 'Medium')
        db.execute("UPDATE Workout SET name=?, description=?, focus=?, intensity=? WHERE workout_id=?",
                   (name, description, focus, intensity, generated_workout_id))
        db.commit()
        return redirect(url_for('workout_list'))

    # Ensure the correct variable name is used when passing to the template
    return render_template('add-workout.html', generated_workout_id=generated_workout_id)

@app.route('/api/add-exercises-to-workout/<int:workout_id>', methods=['POST'])
def add_exercises_to_workout(workout_id):
    db = get_db()
    exercises = request.json.get('exercises')  # Fetch the list of exercise IDs from the request
    try:
        for exercise_id in exercises:
            # Insert each exercise ID and workout ID into the Exercise_In_Workout table
            db.execute("INSERT INTO Exercise_In_Workout (exercise_id, workout_id) VALUES (?, ?)",
                       (exercise_id, workout_id))
        db.commit()  # Commit changes after all inserts are done
        return jsonify({'success': True}), 200
    except Exception as e:
        db.rollback()  # Roll back in case of an error
        print(e)  # Logging the error can help in debugging
        return jsonify({'success': False, 'error': str(e)}), 500



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
        focus = request.form.get('focus', '')
        intensity = request.form.get('intensity', '')
        db.execute("UPDATE Workout SET name=?, description=?, focus=?, intensity=? WHERE workout_id=?",
                   (name, description, focus, intensity, workout_id))
        db.commit()
        return redirect(url_for('workout_list'))
    else:
        cur = db.cursor()
        cur.execute("SELECT * FROM Workout WHERE workout_id = ?", (workout_id,))
        workout = cur.fetchone()
        return render_template('edit-workout.html', workout=workout)


@app.route('/generate-workout-id', methods=['GET'])
def generate_workout_id_endpoint():
    workout_id = generate_workout_id()
    return jsonify(workout_id=workout_id)

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
            db.execute("INSERT INTO Schedule (day_id) VALUES (?)", (day_id,))
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
