import {
  Grid,
  IconButton,
  Tooltip,
  Box,
  Drawer,
  Stack,
  Typography,
  TextField,
  Button,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { lazy, memo, Suspense, useEffect, useState } from "react";

import { bgGradient } from "../constants/color";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  Edit as EditIcon,
  KeyboardBackspace as KeyboardBackspaceIcon,
  LayersClearOutlined,
  Menu as MenuIcon,
} from "@mui/icons-material";

import { useAsyncMutation, useErrors } from "../hooks/hook.jsx";

import { useNavigate, useSearchParams } from "react-router-dom";

import { LayoutLoader } from "../components/layout/Loaders.jsx";

import { Link } from "../components/Styles/StyledComponents";

import AvatarCard from "../components/shared/AvatarCard";

import {
  useAddGroupMembersMutation,
  useChatDetailsQuery,
  useMyGroupsQuery,
  useRemoveGroupMemberMutation,
  useRenameGroupMutation,
  useDeleteChatMutation,
} from "../redux/api/api.js";

import { sampleChats, sampleUsers } from "../constants/sampleData";

import UserItem from "../components/shared/UserItem";
import { useDispatch, useSelector } from "react-redux";
import { setIsAddMember } from "../redux/reducers/misc.js";

const ConfirmDeleteDialog = lazy(
  () => import("../components/dialogs/ConfirmDeleteDialog"),
);
const AddMembersDialog = lazy(
  () => import("../components/dialogs/AddMembersDialog"),
);

// const isAddMember = false;

const Groups = () => {
  const chatId = useSearchParams()[0].get("group");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddMember } = useSelector((state) => state.misc);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [groupName, setGroupName] = useState("");

  const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");

  const myGroups = useMyGroupsQuery("");

  const [members, setMembers] = useState([]);

  const groupDetails = useChatDetailsQuery(
    { chatId, populate: true },
    { skip: !chatId },
  );

  const [updateGroup, isLoadingGroupName] = useAsyncMutation(
    useRenameGroupMutation,
  );

  const [removeMember, isLoadingRemoveMember] = useAsyncMutation(
    useRemoveGroupMemberMutation,
  );

  const [deleteGroup, isLoadingDeleteGroup] = useAsyncMutation(
    useDeleteChatMutation,
  );

  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);

  const errors = [
    {
      isError: myGroups.isError,
      error: myGroups.error,
    },
    {
      isError: groupDetails.isError,
      error: groupDetails.error,
    },
  ];

  useErrors(errors);

  useEffect(() => {
    const groupData = groupDetails.data;

    if (groupData) {
      setGroupName(groupData.chat.name);
      setGroupNameUpdatedValue(groupData.chat.name);
      setMembers(groupData.chat.members);
    }

    return () => {
      setGroupName("");
      setGroupNameUpdatedValue("");
      setMembers([]);
      setIsEdit(false);
    };
  }, [groupDetails.data]);

  const navigateBack = () => {
    navigate("/");
  };

  const handleMobile = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleMobileClose = () => {
    setIsMobileMenuOpen(false);
  };
  const updateGroupName = () => {
    setIsEdit(false);
    updateGroup("Updating Group Name.....", {
      chatId,
      name: groupNameUpdatedValue,
    });
  };

  const confirmDeleteHandler = () => {
    setConfirmDeleteDialog(true);
  };

  const closeConfirmDeleteHandler = () => {
    setConfirmDeleteDialog(false);
  };

  const openAddMemberHandler = () => {
    dispatch(setIsAddMember(true));
  };

  const deleteHandler = () => {
    deleteGroup("Deleting Group ....", chatId);
    closeConfirmDeleteHandler();
    navigate("/groups");
  };

  const removeMemberHandler = (userId) => {
    removeMember("Removing Member ...", { chatId, userId });
  };

  const IconBtns = (
    <>
      <Box
        sx={{
          display: {
            xs: "block",
            sm: "none",
          },
          position: "fixed",
          right: "1rem",
          top: "1rem",
        }}
      >
        <IconButton onClick={handleMobile}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Tooltip title="Back">
        <IconButton
          sx={{
            position: "absolute",
            top: "2rem",
            left: "2rem",
            bgcolor: "rgba(0,0,0,0.8)",
            color: "white",
            ":hover": {
              bgcolor: "rgba(0,0,0,0.6)",
            },
          }}
          onClick={navigateBack}
        >
          <KeyboardBackspaceIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  const GroupName = () => {
    return (
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"center"}
        spacing={"1rem"}
        padding={"3rem"}
      >
        {isEdit ? (
          <>
            <TextField
              value={groupNameUpdatedValue}
              onChange={(e) => setGroupNameUpdatedValue(e.target.value)}
            />
            <IconButton onClick={updateGroupName} disabled={isLoadingGroupName}>
              <DoneIcon />
            </IconButton>
          </>
        ) : (
          <>
            <Typography variant="h4">{groupName}</Typography>
            <IconButton
              disabled={isLoadingGroupName}
              onClick={() => setIsEdit(true)}
            >
              <EditIcon />
            </IconButton>
          </>
        )}
      </Stack>
    );
  };

  const ButtonGroup = () => {
    return (
      <Stack
        direction={{
          sm: "row",
          xs: "column-reverse",
        }}
        spacing={"1rem"}
        p={{
          sm: "1rem",
          xs: "0",
          md: "1rem 4rem",
        }}
      >
        <Button
          size="large"
          color="error"
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={confirmDeleteHandler}
        >
          Delete Group
        </Button>
        <Button
          size="large"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddMemberHandler}
        >
          Add Members
        </Button>
      </Stack>
    );
  };

  return myGroups.isLoading ? (
    <LayoutLoader />
  ) : (
    <Grid container height={"100vh"} width={"100%"}>
      <Grid
        sx={{
          display: {
            xs: "none",
            sm: "block",
          },
        }}
        size={{ sm: 4 }}
      >
        <GroupsList myGroups={myGroups?.data?.groups} chatId={chatId} />
      </Grid>
      <Grid
        size={{ sm: 8, xs: 12 }}
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          position: "relative",
          padding: "1rem 3rem",
          bgcolor: `white`,
        }}
      >
        {IconBtns}

        {groupName && (
          <>
            <GroupName />

            <Typography
              variant="body1"
              alignSelf={"flex-start"}
              margin={"2rem"}
            >
              Members
            </Typography>
            <Stack
              maxWidth={"45rem"}
              width={"100%"}
              boxSizing={"border-box"}
              padding={{
                sm: "1rem",
                xs: "0",
                md: "1rem 4rem",
              }}
              spacing={"2rem"}
              bgcolor={"bisque"}
              height={"50vh"}
              overflow={"auto"}
              borderRadius={"1rem"}
            >
              {/**?MEMBERS */}

              {isLoadingRemoveMember ? (
                <>
                  <CircularProgress />
                </>
              ) : (
                members.map((each) => (
                  <UserItem
                    key={each._id}
                    user={each}
                    isAdded
                    styling={{
                      boxShadow: "0 0 0.5rem rgba(0,0,0,0.2)",
                      padding: "1rem 2rem",
                      borderRadius: "1rem",
                    }}
                    handler={removeMemberHandler}
                  />
                ))
              )}
            </Stack>

            <ButtonGroup />
          </>
        )}
      </Grid>

      {isAddMember && (
        <Suspense fallback={<Backdrop open />}>
          <AddMembersDialog chatId={chatId} />
        </Suspense>
      )}

      {confirmDeleteDialog && (
        <Suspense fallback={<Backdrop open />}>
          <ConfirmDeleteDialog
            open={confirmDeleteDialog}
            handleClose={closeConfirmDeleteHandler}
            deleteHandler={deleteHandler}
          />
        </Suspense>
      )}

      <Drawer
        sx={{
          display: {
            xs: "block",
            sm: "none",
          },
        }}
        open={isMobileMenuOpen}
        onClose={handleMobileClose}
      >
        <GroupsList
          w={"50vw"}
          myGroups={myGroups?.data?.groups}
          chatId={chatId}
        />
      </Drawer>
    </Grid>
  );
};

const GroupsList = ({ w = "100%", myGroups = [], chatId }) => {
  return (
    <Stack
      width={w}
      sx={{
        backgroundImage: bgGradient,
        height: "100vh",
        overflow: "auto",
      }}
    >
      {myGroups.length > 0 ? (
        myGroups.map((each) => (
          <GroupListItem key={each._id} group={each} chatId={chatId} />
        ))
      ) : (
        <Typography textAlign={"center"} padding="1rem" color="black">
          No groups
        </Typography>
      )}
    </Stack>
  );
};

const GroupListItem = memo(({ group, chatId }) => {
  const { name, avatar, _id } = group;

  return (
    <Link
      to={`?group=${_id}`}
      onClick={(e) => {
        if (chatId === _id) e.preventDefault();
      }}
    >
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        <AvatarCard avatar={avatar} />
        <Typography>{name}</Typography>
      </Stack>
    </Link>
  );
});

export default Groups;
