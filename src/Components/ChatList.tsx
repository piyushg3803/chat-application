import { useEffect, useState } from 'react'
import { logOut } from '../backend/authUtil'
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query } from 'firebase/firestore';
import { useAuth } from '../Context/authContext';
import { db } from '../backend/firebaseAuth';

interface User {
  id: string;
  uid?: string;
  name?: string;
}

interface ChatListProps {
  userName: (userName: string, userId: string) => void;
}

function ChatList({ userName }: ChatListProps) {
  const [openMenu, setOpenmenu] = useState(false);
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const handleUsername = (user: User) => {
    userName(user.name || 'Anonymous', user.id)
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)

      if (!currentUser?.uid) {
        console.log('No current user found');
        setLoading(false)
        return;
      }

      try {
        const q = query(
          collection(db, "users"));
        const querySnapshot = await getDocs(q);
        console.log("Snapshot Size", querySnapshot.size);

        const usersList: User[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as Omit<User, "id">;
          return {
            id: doc.id,
            ...data,
          };
        })
          .filter(user => user.id !== currentUser.uid)

        console.log("User List", usersList);
        setUsers(usersList);
      } catch (error: any) {
        console.error("Error Fetching Users:", {
          errorCode: error.code,
          errorMessage: error.message,
          stack: error.stack
        });
        setError(true);
      }
      finally {
        setLoading(false)
      }
    };
    fetchUsers();
  }, [currentUser?.uid]);

  const handlelogout = async () => {
    try {
      await logOut();
      alert('User Logged Out Successfully');
      navigate('/')
    }
    catch (error) {
      setError(true)
      console.log(error);
    }
  }

  const showMenu = () => {
    setOpenmenu(!openMenu)
  }
  return (
    <div className='relative bg-gray-900 text-white h-screen w-[25%]'>
      <div className='p-3 flex items-center justify-between border-b-1 border-gray-800'>
        <div className='flex items-center'>
          <img className='' src="chat.png" alt="" />
          <h1 className='text-2xl ps-4 font-semibold'>Chats</h1>
        </div>
        <div className='m-4'>
          <img src="search.png" alt="" />
        </div>
      </div>
      <div className='h-[85%]'>
        {loading ? (
          <div className='flex justify-center items-center h-full'>
            Loading Chat List...
          </div>
        ) : error ? (
          <div className='text-red-500 p-4'>{error}</div>
        ) : !users || users.length === 0 ?
          (
            <div className='text-center p-4'>No users found</div>
          ) :
          (users.map((user) => (
            <div key={user.id} onClick={() => handleUsername(user)} className='p-2 flex items-center justify-between border-b border-gray-800 cursor-pointer'>
              <div className='flex p-2'>
                <img className='w-12 rounded-full brightness-50' src="profile-icon.png" alt="" />
                <div>
                  <h1 className='text-2xl ps-4 '>{user.name || 'Anonymous'}</h1>
                  <p className='text-sm ps-4 text-zinc-400'>Last Message</p>
                </div>
              </div>
              <div className='m-4'>
                <p className='text-sm ps-4 text-zinc-400'>Date</p>
              </div>
            </div>
          )))
        }
      </div>

      <div className='border-t-1 border-gray-800 p-2 flex justify-between'>
        <img className='w-10 rounded-full brightness-50' src="profile-icon.png" alt="" />
        <div>
          <img onClick={showMenu} className='p-2' src="settings.png" alt="" />
        </div>

        <ul className={`absolute ${!openMenu ? 'hidden' : 'block'} bottom-14 end-4 bg-gray-800 p-3 rounded-xl`}>
          <li onClick={handlelogout}>Logout</li>
        </ul>
      </div>
    </div>
  )
}

export default ChatList