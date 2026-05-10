import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [lessons, setLessons] = useState([]);
  const [lessonInput, setLessonInput] = useState({ title: '', videoUrl: '', duration: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleEnroll = async (id) => {
    try {
      await api.post(`/courses/${id}/enroll`);
      navigate(`/courses/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll');
    }
  };

  const addLesson = () => {
    const { title, videoUrl, duration } = lessonInput;
    if (!title || !videoUrl || !duration) return;
    setLessons([...lessons, { title, videoUrl, duration: Number(duration) }]);
    setLessonInput({ title: '', videoUrl: '', duration: '' });
  };

  const removeLesson = (i) => setLessons(lessons.filter((_, idx) => idx !== i));

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/courses', {
        title: form.title,
        description: form.description,
        instructorName: user?.name || user?.email || 'Instructor', // fallback for old tokens
        lessons,
      });
      setForm({ title: '', description: '' });
      setLessons([]);
      setShowForm(false);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const myCourses = courses.filter(c => c.instructorId === user?._id);
  const displayCourses = user?.role === 'instructor' ? myCourses : courses;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'instructor' ? 'My Courses' : 'Available Courses'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.role === 'instructor'
              ? `${myCourses.length} course${myCourses.length !== 1 ? 's' : ''} created`
              : `${courses.length} course${courses.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        {user?.role === 'instructor' && (
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow transition text-white
              ${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-brand hover:bg-brand-dark'}`}
          >
            {showForm ? '✕ Cancel' : '+ New Course'}
          </button>
        )}
      </div>

      {/* ── Create Course Form ─────────────────────────────────────────────── */}
      {showForm && user?.role === 'instructor' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-7 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Create a New Course</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateCourse} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Introduction to React"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition text-gray-900"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
              <textarea
                required
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What will students learn in this course?"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition resize-none text-gray-900"
              />
            </div>

            {/* Lessons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lessons <span className="font-normal text-gray-400">(optional — you can add these later)</span>
              </label>

              {/* Existing lessons list */}
              {lessons.length > 0 && (
                <ul className="mb-3 space-y-2">
                  {lessons.map((l, i) => (
                    <li key={i} className="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-lg px-4 py-2.5 text-sm">
                      <span className="w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <span className="font-medium text-gray-800 flex-1 truncate">{l.title}</span>
                      <span className="text-gray-400 text-xs shrink-0">{l.duration} min</span>
                      <button
                        type="button"
                        onClick={() => removeLesson(i)}
                        className="text-red-400 hover:text-red-600 transition ml-1 shrink-0"
                        title="Remove lesson"
                      >✕</button>
                    </li>
                  ))}
                </ul>
              )}

              {/* New lesson input row */}
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={lessonInput.title}
                  onChange={e => setLessonInput({ ...lessonInput, title: e.target.value })}
                  placeholder="Lesson title"
                  className="flex-1 min-w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition"
                />
                <input
                  type="url"
                  value={lessonInput.videoUrl}
                  onChange={e => setLessonInput({ ...lessonInput, videoUrl: e.target.value })}
                  placeholder="Video URL (https://...)"
                  className="flex-1 min-w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition"
                />
                <input
                  type="number"
                  min="1"
                  value={lessonInput.duration}
                  onChange={e => setLessonInput({ ...lessonInput, duration: e.target.value })}
                  placeholder="Min"
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition"
                />
                <button
                  type="button"
                  onClick={addLesson}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  + Add Lesson
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-white py-3 rounded-lg font-bold text-base hover:bg-brand-dark active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating…' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      {/* ── Course Grid ───────────────────────────────────────────────────── */}
      {displayCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map(course => (
            <div
              key={course._id}
              className="bg-white rounded-xl shadow-md border-t-4 border-brand p-6 hover:shadow-xl transition group flex flex-col"
            >
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand transition leading-tight">
                  {course.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {course.description}
                </p>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pt-3 border-t border-gray-100">
                  <span>👤 {course.instructorName}</span>
                  <span className="flex gap-3">
                    <span>📖 {course.lessons?.length ?? 0} lesson{course.lessons?.length !== 1 ? 's' : ''}</span>
                    <span>🎓 {course.enrolledStudents?.length ?? 0} enrolled</span>
                  </span>
                </div>

                {user?.role === 'student' && (
                  course.enrolledStudents?.includes(user?._id) ? (
                    <Link
                      to={`/courses/${course._id}`}
                      className="w-full inline-block text-center bg-gray-100 text-brand py-2 rounded-lg hover:bg-gray-200 transition font-bold text-sm active:scale-95 border border-brand/20"
                    >
                      Go to Course &rarr;
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      className="w-full bg-brand text-white py-2 rounded-lg hover:bg-brand-dark transition font-semibold text-sm active:scale-95"
                    >
                      Enroll Now
                    </button>
                  )
                )}
                {user?.role === 'instructor' && course.instructorId === user?._id && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="inline-block text-xs bg-brand/10 text-brand px-3 py-1.5 rounded-full font-semibold">
                      ✓ Your course
                    </span>
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-brand text-sm font-semibold hover:underline"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400">
          <p className="text-6xl mb-5">📚</p>
          <p className="text-xl font-semibold text-gray-500">
            {user?.role === 'instructor' ? "You haven't created any courses yet." : 'No courses available yet.'}
          </p>
          {user?.role === 'instructor' && (
            <p className="text-sm mt-2">Hit <strong>"+ New Course"</strong> above to get started!</p>
          )}
          {user?.role === 'student' && (
            <p className="text-sm mt-2">Check back soon — instructors are adding content.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;
