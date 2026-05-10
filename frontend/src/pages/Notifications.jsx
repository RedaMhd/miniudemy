import { useState, useEffect } from 'react';
import api from '../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Notifications</h1>
      <div className="space-y-4">
        {notifications.map(notification => (
          <div key={notification._id} className={`p-4 rounded-lg shadow border-l-4 ${notification.read ? 'bg-gray-50 border-gray-300' : 'bg-white border-brand'}`}>
            <p className={`mb-2 ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{notification.message}</p>
            {!notification.read && (
              <button onClick={() => markAsRead(notification._id)} className="text-sm text-brand hover:underline">Mark as read</button>
            )}
          </div>
        ))}
      </div>
      {notifications.length === 0 && <p className="text-gray-500 text-center mt-10">You have no notifications.</p>}
    </div>
  );
};

export default Notifications;
