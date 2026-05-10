import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);

        if (user?.role === 'student') {
          try {
            const progRes = await api.get('/progress/my-progress');
            const pMap = {};
            progRes.data.forEach(p => {
              pMap[p.courseId] = p.progressPercentage;
            });
            setProgressMap(pMap);
          } catch (err) {
            console.error('Failed to fetch progress', err);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user?.role]);

  // Derived state for student courses
  const myEnrolledCourses = courses.filter(c => c.enrolledStudents?.includes(user?._id));
  const activeCourses = myEnrolledCourses.filter(c => (progressMap[c._id] || 0) < 100);
  const completedCourses = myEnrolledCourses.filter(c => progressMap[c._id] === 100);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand">
          <h2 className="text-xl font-bold mb-2">Your Profile</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-2">Quick Stats</h2>
          {user?.role === 'student' ? (
            <p>Ready to learn? Browse our courses and enroll today!</p>
          ) : (
            <p>You have {courses.filter(c => c.instructorId === user?._id).length} active courses.</p>
          )}
          <Link to="/courses" className="inline-block mt-4 text-brand font-semibold hover:underline">View Courses &rarr;</Link>
        </div>
      </div>

      {/* Active Courses */}
      {user?.role === 'student' && activeCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">My Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.map(course => (
              <div key={course._id} className="bg-white p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand h-1.5 rounded-full"
                      style={{ width: `${progressMap[course._id] || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">{progressMap[course._id] || 0}% completed</p>
                </div>
                <Link 
                  to={`/courses/${course._id}`} 
                  className="w-full block text-center bg-brand text-white py-2 rounded hover:bg-brand-dark transition font-semibold text-sm"
                >
                  Continue Learning
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Courses */}
      {user?.role === 'student' && completedCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Completed Courses 🎓</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.map(course => (
              <div key={course._id} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold mb-4">
                  100% Completed
                </span>
                <Link 
                  to={`/courses/${course._id}`} 
                  className="w-full block text-center bg-white text-gray-600 border border-gray-300 py-2 rounded hover:bg-gray-100 transition font-semibold text-sm"
                >
                  Review Course
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
