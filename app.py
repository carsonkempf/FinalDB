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
    cur.execute("SELECT * FROM Day JOIN Workout_On_Day ON Day.day_id = Workout_On_Day.day_id")
    days = cur.fetchall()
    return render_template('schedule.html', days=days)

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

if __name__ == '__main__':
    app.run(debug=True)
