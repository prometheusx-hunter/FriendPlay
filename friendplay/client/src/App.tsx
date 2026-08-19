import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { SocketProvider } from './socket/SocketContext';
import { RoomProvider } from './features/rooms/RoomContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <RoomProvider>
            <AppRoutes />
          </RoomProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;