import {
    Button,
    Dialog,
    DialogTitle,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import {
    useAddGroupMembersMutation,
    useAvailableFriendsQuery,
} from "../../redux/api/api";
import { setIsAddMember } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";

const AddMembersDialog = ({ chatId }) => {
  const dispatch = useDispatch();
  const { isAddMember } = useSelector((state) => state.misc);

  const { isLoading, data, isError, error } = useAvailableFriendsQuery(chatId);

  const [addMembers, isLoadingAddMembers] = useAsyncMutation(
    useAddGroupMembersMutation,
  ); 
  const [selectedMembers, setSelectedMembers] = useState([]);

  const selectMemberHandler = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((currentId) => currentId !== id)
        : [...prev, id],
    );
  };

  const addMemberSubmitHandler = () => {
    addMembers("Adding Members ... ", { members: selectedMembers, chatId });
    closeHandler();
  };

  const closeHandler = () => {
    dispatch(setIsAddMember(false));
  };
 
  useErrors([{ isError, error }]);

  return (
    <Dialog open={isAddMember} onClose={closeHandler}>
      <Stack p={"2rem"} width={"20rem"} spacing={"2rem"}>
        <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
        <Stack spacing={"1rem"}>
          {isLoading ? (
            <Skeleton />
          ) : data?.friends?.length > 0 ? (
            data?.friends?.map((each) => (
              <UserItem
                key={each._id}
                user={each}
                handler={selectMemberHandler}
                isAdded={selectedMembers.includes(each._id)}
              />
            ))
          ) : (
            <Typography textAlign={"center"}>No Friends</Typography>
          )}
        </Stack>

        <Button color="error" variant="outlined" onClick={closeHandler}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isLoadingAddMembers}
          onClick={addMemberSubmitHandler}
        >
          Submit Changes
        </Button>
      </Stack>
    </Dialog>
  );
};

export default AddMembersDialog;
