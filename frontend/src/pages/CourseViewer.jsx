import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

// Helper to safely embed videos, especially YouTube links
const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  return url;
};

const CourseViewer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ completedLessons: [], progressPercentage: 0 });
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data);

        // Fetch progress if student
        if (user?.role === 'student') {
          try {
            const progRes = await api.get(`/progress/${id}`);
            if (progRes.data) {
              setProgress(progRes.data);
            }
          } catch (err) {
            console.error('Failed to fetch progress:', err);
          }
        }
      } catch (err) {
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndProgress();
  }, [id, user?.role]);

  const markAsComplete = async (lessonId) => {
    try {
      const res = await api.post('/progress/complete-lesson', {
        courseId: id,
        lessonId,
      });
      setProgress(res.data);
      
      // Check for full completion
      if (res.data.progressPercentage === 100) {
        setTimeout(() => {
          alert('Congratulations! You have successfully completed the course! 🎓');
          navigate('/dashboard');
        }, 500);
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const lessons = course?.lessons || [];
  const activeLesson = lessons[activeLessonIndex];
  const isCompleted = activeLesson ? progress.completedLessons.includes(activeLesson._id) : false;



  if (loading) return <div className="p-8 text-center text-gray-500">Loading course...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!course) return <div className="p-8 text-center text-gray-500">Course not found</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* ── Left Pane: Video Player & Details ──────────────────────────── */}
      <div className="flex-1">
        <div className="mb-4">
          <Link to="/courses" className="text-brand hover:underline text-sm font-semibold mb-2 inline-block">
            &larr; Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{course.title}</h1>
          <p className="text-gray-500 text-sm mb-4">Instructor: {course.instructorName}</p>
        </div>

        {activeLesson ? (
          <div className="bg-black aspect-video rounded-xl overflow-hidden shadow-lg mb-6 border border-gray-800 relative">
            <iframe
              src={getEmbedUrl(activeLesson.videoUrl)}
              title={activeLesson.title}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        ) : (
          <div className="bg-gray-100 aspect-video rounded-xl flex items-center justify-center text-gray-400 mb-6">
            <p>No lessons available for this course yet.</p>
          </div>
        )}

        {activeLesson && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {activeLessonIndex + 1}. {activeLesson.title}
                </h2>
                <span className="text-gray-500 text-sm">Duration: {activeLesson.duration} mins</span>
              </div>

              {user?.role === 'student' && (
                <button
                  onClick={() => markAsComplete(activeLesson._id)}
                  disabled={isCompleted}
                  className={`px-5 py-2.5 rounded-lg font-bold text-sm transition shadow-sm ${
                    isCompleted
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-brand hover:bg-brand-dark text-white active:scale-95'
                  }`}
                >
                  {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                </button>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-2">About this Course</h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                {course.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Pane: Lesson Sidebar ──────────────────────────────────── */}
      <div className="lg:w-96 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">Course Content</h3>
            
            {user?.role === 'student' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-gray-600">
                  <span>Your Progress</span>
                  <span className="text-brand">{progress.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress.progressPercentage || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right mt-1">
                  {progress.completedLessons?.length || 0} / {lessons.length} completed
                </p>
              </div>
            )}
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {lessons.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {lessons.map((lesson, idx) => {
                  const isActive = idx === activeLessonIndex;
                  const isDone = progress.completedLessons?.includes(lesson._id);

                  return (
                    <li key={lesson._id}>
                      <button
                        onClick={() => setActiveLessonIndex(idx)}
                        className={`w-full text-left px-5 py-4 transition flex gap-3 items-start group ${
                          isActive ? 'bg-brand/5 border-l-4 border-brand' : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                      >
                        {/* Checkbox Icon */}
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition
                          ${isDone 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 group-hover:border-brand bg-white'
                          }
                        `}>
                          {isDone ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-brand/30"></span>
                          )}
                        </div>

                        {/* Title & Meta */}
                        <div className="flex-1">
                          <p className={`text-sm font-medium leading-tight mb-1 ${isActive ? 'text-brand' : 'text-gray-700 group-hover:text-brand'}`}>
                            {idx + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {lesson.duration} min
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">
                Lessons will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
