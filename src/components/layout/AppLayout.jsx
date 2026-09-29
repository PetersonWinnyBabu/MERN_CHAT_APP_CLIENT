import { Drawer, Grid, Skeleton } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { tealColor } from "../../constants/color.js";
import { useMyChatsQuery } from "../../redux/api/api.js";
import {
  setIsDeleteMenu,
  setIsMobile,
  setSelectedDeleteChat,
} from "../../redux/reducers/misc.js";
import Title from "../shared/Title.jsx";
import ChatList from "../specific/ChatList.jsx";
import Profile from "../specific/Profile.jsx";
import Header from "./Header.jsx";

import {
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
} from "../../constants/events.js";
import { useErrors, useSocketEvents } from "../../hooks/hook.jsx";
import { getOrSaveFromStorage } from "../../lib/features.js";
import {
  incrementNotificationCount,
  setNewMessagesAlert,
} from "../../redux/reducers/chat.js";
import { getSocket } from "../../socket.jsx";
import DeleteChatMenu from "../dialogs/DeleteChatMenu.jsx";

const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const chatId = params.chatId;
    const deleteMenuAnchor = useRef(null);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const { isMobile } = useSelector((state) => state.misc);

    const { user } = useSelector((state) => state.auth);

    const { newMessagesAlert } = useSelector((state) => state.chat);

    const { isLoading, data, isError, error, refetch } = useMyChatsQuery(
      undefined,
      { skip: !user, refetchOnMountOrArgChange: true },
    );

    useErrors([{ isError, error }]);

    // const socket = getSocket();
    const socket = useMemo(() => getSocket(), []);

    useEffect(() => {
      getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
    }, [newMessagesAlert]);

    const handleDeleteChat = (e, _id, groupChat) => {
      dispatch(setIsDeleteMenu(true));
      dispatch(setSelectedDeleteChat({ chatId, groupChat }));
      deleteMenuAnchor.current = e.currentTarget;

      console.log("delete chat", _id, groupChat);
    };

    const handleMobileClose = () => {
      dispatch(setIsMobile(false));
    };

    const newMessageAlertListener = useCallback(
      (data) => {
        if (data.chatId === chatId) return;
        dispatch(setNewMessagesAlert(data));
      },
      [chatId],
    );

    const newRequestListener = useCallback(() => {
      dispatch(incrementNotificationCount());
    }, [dispatch]);

    const refetchListener = useCallback(() => {
      refetch();
      navigate("/");
    }, [refetch, navigate]);

    const onlineUsersListener = useCallback((data) => {
      setOnlineUsers(data);
      console.log(data);
    }, []);

    const eventHandlers = {
      [NEW_MESSAGE_ALERT]: newMessageAlertListener,
      [NEW_REQUEST]: newRequestListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
    };

    useSocketEvents(socket, eventHandlers);

    return (
      <>
        <Title />

        <Header />

        <DeleteChatMenu
          dispatch={dispatch}
          deleteMenuAnchor={deleteMenuAnchor}
        />
        {isLoading ? (
          <Skeleton />
        ) : (
          <Drawer open={isMobile} onClose={handleMobileClose}>
            <ChatList
              w="70vw"
              chats={data?.chats || []}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              user={user}
              onlineUsers={onlineUsers}
            ></ChatList>
          </Drawer>
        )}

        <Grid container height={"calc(100vh - 4rem)"} spacing={0}>
          <Grid
            size={{ sm: 4, md: 3 }}
            sx={{
              display: { xs: "none", sm: "block" },
            }}
            height={"100%"}
            bgcolor={"white"}
          >
            {isLoading ? (
              <Skeleton />
            ) : (
              <ChatList
                chats={data?.chats || []}
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
                newMessagesAlert={newMessagesAlert}
                user={user}
                onlineUsers={onlineUsers}
              />
            )}
          </Grid>

          <Grid
            size={{ xs: 12, sm: 8, md: 5, lg: 6 }}
            sx={{
              display: { xs: "block", sm: "block" },
            }}
            height="90%"
          >
            <WrappedComponent
              {...props}
              socket={socket}
              chatId={chatId}
              user={user}
            />
          </Grid>

          <Grid
            size={{ xs: 0, sm: 0, md: 4, lg: 3 }}
            sx={{
              display: { xs: "none", md: "block" },
              padding: "2rem",
              bgcolor: `${tealColor}`,
            }}
          >
            <Profile user={user} />
          </Grid>
        </Grid>
      </>
    );
  };
};

export default AppLayout;
